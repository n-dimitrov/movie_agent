import {
  getNowPlayingMovies,
  getUpcomingMovies,
  getMovieDetails,
  searchMovies,
} from "../tools";

interface ToolDef {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

interface AgentConfig {
  maxIterations?: number;
}

function buildEndpoint(): { url: string; apiKey: string } {
  const baseURL = process.env.ANTHROPIC_VERTEX_BASE_URL;
  const apiKey = process.env.ANTHROPIC_AUTH_TOKEN;
  const projectId = process.env.ANTHROPIC_VERTEX_PROJECT_ID || "_";
  const region = process.env.CLOUD_ML_REGION || "_";
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  if (!baseURL) throw new Error("ANTHROPIC_VERTEX_BASE_URL is not configured");
  if (!apiKey) throw new Error("ANTHROPIC_AUTH_TOKEN is not configured");

  const url = `${baseURL}/projects/${projectId}/locations/${region}/publishers/anthropic/models/${model}:rawPredict`;
  return { url, apiKey };
}

async function callClaude(
  endpoint: { url: string; apiKey: string },
  body: Record<string, unknown>
): Promise<any> {
  const res = await fetch(endpoint.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": endpoint.apiKey,
    },
    body: JSON.stringify({
      anthropic_version: "vertex-2023-10-16",
      ...body,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Vertex API error ${res.status}: ${error}`);
  }

  return res.json();
}

export async function generateBoxOfficeDigest(
  config: AgentConfig = {}
): Promise<string> {
  const endpoint = buildEndpoint();

  const tools: ToolDef[] = [
    {
      name: "get_now_playing_movies",
      description:
        "Get a list of movies currently playing in theaters (US region). Returns up to 20 movies with title, overview, release date, popularity, and poster_path. Use poster_path to build image URLs: https://image.tmdb.org/t/p/w500{poster_path}",
      input_schema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "get_upcoming_movies",
      description:
        "Get a list of upcoming movie releases (US region). Returns up to 20 movies with title, overview, release date, popularity, and poster path.",
      input_schema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "get_movie_details",
      description:
        "Get detailed information about a specific movie by ID, including budget, revenue (box office gross), status, and poster_path. Use revenue to rank movies by box office performance. Build poster image URLs: https://image.tmdb.org/t/p/w500{poster_path}",
      input_schema: {
        type: "object",
        properties: {
          movieId: {
            type: "number",
            description: "The TMDb movie ID",
          },
        },
        required: ["movieId"],
      },
    },
    {
      name: "search_movies",
      description:
        "Search for movies by title. Returns up to 10 matching movies.",
      input_schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The movie title to search for",
          },
        },
        required: ["query"],
      },
    },
  ];

  const systemPrompt = `You are a box office analyst creating a newsletter-style digest of the week's top box office performers and upcoming releases.

Your task:
1. Use get_now_playing_movies to get current theatrical releases
2. Use get_movie_details for EACH now-playing movie to get revenue and budget data
3. Sort movies by revenue (box office gross) descending
4. Select the TOP 5 movies by revenue only
5. Use get_upcoming_movies to get upcoming releases for this/next week
6. Produce a rich HTML digest with TWO sections:

HEADER:
- Title "Box Office Digest" followed by today's date (e.g. "May 22, 2026") on the next line

SECTION 1 — TOP 5 BOX OFFICE:
For each movie, include:
- Movie poster image using: <img src="https://image.tmdb.org/t/p/w500{poster_path}" alt="{title}" />
- Title as a link to TMDb: <a href="https://www.themoviedb.org/movie/{id}">{title}</a>
- Release date and rating
- Box office revenue and budget figures
- Brief analysis (performance vs budget, trends, notable achievements)

SECTION 2 — UPCOMING THIS/NEXT WEEK:
For each upcoming movie releasing in the next 7-14 days, include:
- Movie poster image using: <img src="https://image.tmdb.org/t/p/w500{poster_path}" alt="{title}" />
- Title as a link to TMDb: <a href="https://www.themoviedb.org/movie/{id}">{title}</a>
- Release date
- Brief description of what to expect

Format rules:
- Output clean, self-contained HTML with inline styles
- Include poster images prominently for each movie
- Every movie title must link to its TMDb page
- Rank box office movies by revenue, NOT popularity
- Keep output focused, under 2500 words
- Dark theme styling (dark background, light text)`;

  const messages: any[] = [
    {
      role: "user",
      content: "Generate the latest box office digest.",
    },
  ];

  const maxIterations = config.maxIterations || 15;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;

    console.log(`Agent iteration ${iterations}...`);

    const response = await callClaude(endpoint, {
      max_tokens: 8192,
      system: systemPrompt,
      messages,
      tools,
    });

    if (response.stop_reason === "end_turn" || response.stop_reason === "max_tokens") {
      const textContent = response.content.find(
        (c: any) => c.type === "text"
      );
      if (textContent) {
        let html = textContent.text;
        const match = html.match(/```html?\s*\n([\s\S]*?)```/);
        if (match) {
          html = match[1].trim();
        }
        return html;
      }
      throw new Error("Agent finished without producing text output");
    }

    if (response.stop_reason === "tool_use") {
      messages.push({
        role: "assistant",
        content: response.content,
      });

      const toolResults: any[] = [];

      for (const block of response.content) {
        if (block.type === "tool_use") {
          let result: any;

          try {
            console.log(`  Tool call: ${block.name}`);

            switch (block.name) {
              case "get_now_playing_movies":
                result = await getNowPlayingMovies();
                break;

              case "get_upcoming_movies":
                result = await getUpcomingMovies();
                break;

              case "get_movie_details": {
                const { movieId } = block.input as { movieId: number };
                result = await getMovieDetails(movieId);
                break;
              }

              case "search_movies": {
                const { query } = block.input as { query: string };
                result = await searchMovies(query);
                break;
              }

              default:
                result = { error: `Unknown tool: ${block.name}` };
            }
          } catch (error) {
            result = {
              error:
                error instanceof Error
                  ? error.message
                  : "Tool execution failed",
            };
          }

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }

      messages.push({
        role: "user",
        content: toolResults,
      });

      continue;
    }

    throw new Error(`Unexpected stop reason: ${response.stop_reason}`);
  }

  throw new Error(`Agent exceeded maximum iterations (${maxIterations})`);
}
