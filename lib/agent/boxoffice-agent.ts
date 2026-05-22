import {
  getNowPlayingMovies,
  getUpcomingMovies,
  getMovieDetails,
  searchMovies,
} from "../tools";
import { DigestData } from "../templates/digest-types";
import { renderDigest } from "../templates/digest-template";

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

  const systemPrompt = `You are a box office analyst. Your job is to gather movie data and return structured JSON.

Your task:
1. Use get_now_playing_movies to get current theatrical releases
2. Use get_movie_details for EACH now-playing movie to get revenue and budget data
3. Sort movies by revenue (box office gross) descending
4. Select the TOP 5 movies by revenue only
5. Use get_upcoming_movies to get upcoming releases for this/next week (next 7-14 days)

After gathering all data, output ONLY a valid JSON object with this exact structure (no markdown, no code blocks, no explanation):

{
  "generatedDate": "May 22, 2026",
  "topMovies": [
    {
      "id": 12345,
      "title": "Movie Title",
      "releaseDate": "May 15, 2026",
      "posterPath": "/abc123.jpg",
      "revenue": 150000000,
      "budget": 80000000,
      "rating": 7.5,
      "analysis": "One or two sentences about box office performance, trends, or notable achievements."
    }
  ],
  "upcomingMovies": [
    {
      "id": 67890,
      "title": "Upcoming Movie",
      "releaseDate": "May 29, 2026",
      "posterPath": "/def456.jpg",
      "description": "One or two sentences about what to expect from this film."
    }
  ]
}

Rules:
- topMovies: exactly 5 movies, sorted by revenue descending
- upcomingMovies: movies releasing in the next 7-14 days
- posterPath: use the raw poster_path value from TMDb (e.g. "/abc123.jpg")
- revenue and budget: raw numbers, not formatted strings
- rating: vote_average from TMDb
- Output ONLY the JSON object, nothing else`;

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
        let raw = textContent.text.trim();
        const codeBlockMatch = raw.match(/```(?:json)?\s*\n([\s\S]*?)```/);
        if (codeBlockMatch) {
          raw = codeBlockMatch[1].trim();
        } else {
          const jsonMatch = raw.match(/\{[\s\S]*"generatedDate"[\s\S]*\}$/);
          if (jsonMatch) {
            raw = jsonMatch[0];
          }
        }
        const digestData: DigestData = JSON.parse(raw);
        return renderDigest(digestData);
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
