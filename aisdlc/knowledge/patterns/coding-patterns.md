# Coding Patterns

## File organization

Components live in `components/` as kebab-case files with a single named export matching the PascalCase component name. Utilities live in `lib/`. API routes use the Next.js App Router convention at `app/api/<resource>/route.ts`.

```typescript
// components/movie-card.tsx
export function MovieCard({ movie }: { movie: Movie }) { ... }

// lib/tmdb.ts
export async function getTopMovies(year: number, month: number): Promise<Movie[]> { ... }

// app/api/movies/route.ts
export async function GET(request: NextRequest) { ... }
```

## Error handling

**API routes:** Try/catch around external calls, return appropriate HTTP status codes. 400 for bad input, 502 for upstream failures.

```typescript
// app/api/movies/route.ts
try {
  const movies = await getTopMovies(year, month);
  return NextResponse.json(movies);
} catch {
  return NextResponse.json(
    { error: "Failed to fetch movies from TMDb" },
    { status: 502 }
  );
}
```

**Client-side:** Try/catch around fetch calls, set empty state on error. No error toasts or user-facing error messages — silently degrades to empty results.

```typescript
// app/page.tsx
try {
  const res = await fetch(`/api/movies?year=${y}&month=${m}`);
  if (!res.ok) throw new Error("Failed to fetch");
  const data: Movie[] = await res.json();
  setMovies(data);
} catch {
  setMovies([]);
}
```

**Library code:** Throw errors for missing configuration or API failures. Let callers handle them.

```typescript
// lib/tmdb.ts
if (!apiKey) throw new Error("TMDB_API_KEY is not configured");
if (!res.ok) throw new Error(`TMDb API returned ${res.status}`);
```

## Data access

No database. All data comes from the TMDb API via `lib/tmdb.ts`. The single function `getTopMovies` is the only data access point. External API calls use native `fetch` with `AbortController` for timeouts.

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);
try {
  const res = await fetch(url, { signal: controller.signal });
  // ...
} finally {
  clearTimeout(timeout);
}
```

## Logging

No logging framework is used. Errors are thrown or caught silently. No `console.log` in production code.

## Configuration

Environment variables only. The single config value (`TMDB_API_KEY`) is accessed via `process.env.TMDB_API_KEY` in server-side code. Local development uses a `.env` file sourced by `start.sh`. Deployment injects it via `--set-env-vars` in `deploy.sh`.

## Auth

No authentication. The API route is public. The only "secret" is the TMDb API key, which is kept server-side via the API route proxy pattern.

## Styling

Dark theme using CSS custom properties in `globals.css`, mapped to Tailwind utilities via `@theme inline` (Tailwind v4). All components use Tailwind utility classes referencing these custom colors:

```css
/* globals.css */
:root {
  --background: #0f0f0f;
  --surface: #1a1a2e;
  --accent: #6366f1;
  /* ... */
}

@theme inline {
  --color-surface: var(--surface);
  --color-accent: var(--accent);
}
```

```tsx
// Usage in components
<div className="bg-surface text-foreground border-border">
```

## Component patterns

Props are typed inline at the function parameter level, not as separate interfaces. Components use named exports (not default exports). Client components are marked with `"use client"` at the top.

```typescript
export function MovieGrid({
  movies,
  loading,
  hasSearched,
}: {
  movies: Movie[];
  loading: boolean;
  hasSearched: boolean;
}) { ... }
```

## Agent tool patterns

Agent tools (for Claude Agent SDK) are implemented as async functions in `lib/tools/`. Each tool wraps an external API with the same error handling and timeout patterns used elsewhere in the project.

```typescript
// lib/tools/tmdb-tool.ts
async function tmdbFetch(endpoint: string, params: URLSearchParams): Promise<any> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not configured");
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  
  try {
    const res = await fetch(`https://api.themoviedb.org/3${endpoint}?${params}`, 
      { signal: controller.signal });
    if (!res.ok) throw new Error(`TMDb API returned ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
  // tool implementation
}
```

## Agent orchestration pattern

Agent functions live in `lib/agent/`. They configure the Anthropic SDK client for the Vertex proxy, define tools and system prompts, and implement the standard tool-calling loop.

```typescript
// lib/agent/boxoffice-agent.ts
import Anthropic from "@anthropic-ai/sdk";

export async function generateBoxOfficeDigest(): Promise<string> {
  const baseURL = process.env.ANTHROPIC_VERTEX_BASE_URL;
  const apiKey = process.env.ANTHROPIC_AUTH_TOKEN;
  
  if (!baseURL) throw new Error("ANTHROPIC_VERTEX_BASE_URL is not configured");
  if (!apiKey) throw new Error("ANTHROPIC_AUTH_TOKEN is not configured");
  
  const client = new Anthropic({ baseURL, apiKey });
  
  const tools: Anthropic.Tool[] = [
    {
      name: "get_now_playing_movies",
      description: "Get movies currently in theaters",
      input_schema: { type: "object", properties: {}, required: [] },
    },
  ];
  
  // Agent loop: messages.create() → handle tool_use → return final text
}
```

Tool errors are caught and wrapped in result objects (not thrown) so the agent can see the error and decide how to proceed.
