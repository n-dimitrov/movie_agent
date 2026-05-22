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
        "Get a list of movies currently playing in theaters (US region). Returns up to 20 movies with title, overview, release date, popularity, and poster path.",
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
        "Get detailed information about a specific movie by ID, including budget, revenue, and status. Use this to enrich box office data with financial details.",
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

  const systemPrompt = `You are a box office analyst creating a newsletter-style digest of current movie performance.

Your task:
1. Use get_now_playing_movies to see what's currently in theaters
2. Use get_upcoming_movies to check upcoming releases
3. Use get_movie_details for revenue and budget data on notable films
4. Produce a rich HTML digest with:
   - Current movies in theaters ranked by popularity
   - Revenue and budget analysis for top films
   - Notable performances (high revenue vs budget ratio, etc.)
   - Upcoming releases worth watching
   - Trends and insights

Format the output as concise, clean HTML. Keep total output under 3000 words. Focus on the top 10 movies only.`;

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
