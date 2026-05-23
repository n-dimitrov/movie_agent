# Architecture Overview

## System topology

```
┌─────────────────────────────────────────────────────────┐
│                     Cloud Run                           │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Next.js (standalone)                  │  │
│  │                                                   │  │
│  │  ┌─────────────┐     ┌──────────────────────┐    │  │
│  │  │  Browser     │────▶│  app/page.tsx         │    │  │
│  │  │  (React 19)  │     │  "use client"         │    │  │
│  │  │              │     │  + components/         │    │  │
│  │  └─────────────┘     └──────────┬───────────┘    │  │
│  │                                  │ fetch          │  │
│  │                                  ▼                │  │
│  │                       ┌──────────────────────┐    │  │
│  │                       │  app/api/movies/      │    │  │
│  │                       │  route.ts             │    │  │
│  │                       │  (Next.js API Route)  │    │  │
│  │                       └──────────┬───────────┘    │  │
│  └──────────────────────────────────┼────────────────┘  │
│                                     │                    │
└─────────────────────────────────────┼────────────────────┘
                                      │ HTTPS
                                      ▼
                           ┌──────────────────────┐
                           │   TMDb API v3         │
                           │   api.themoviedb.org  │
                           └──────────────────────┘
```

## Data flows

### Movie Discovery (main flow)

1. User selects year + month in `Header` component, clicks "Get Movies" (or "Random")
2. `Home` component (`app/page.tsx`) calls `fetch("/api/movies?year=X&month=Y")`
3. API route (`app/api/movies/route.ts`) validates params, calls `getTopMovies(year, month)` from `lib/tmdb.ts`
4. `getTopMovies` constructs TMDb discover URL with date range, sends request with 10s abort timeout
5. TMDb returns paginated results; `getTopMovies` slices to top 5 by popularity
6. API route returns JSON array of `Movie` objects
7. `Home` sets state → `MovieGrid` renders `MovieCard` components with poster images from `image.tmdb.org`

### Image loading

Movie poster images are loaded directly from `image.tmdb.org` by the browser via Next.js `<Image>` component. The `next.config.ts` allowlists this domain in `images.remotePatterns`.

## Key boundaries

- **Client / Server boundary**: `app/page.tsx` is `"use client"` — all UI state lives client-side. The server-side boundary is the API route in `app/api/movies/route.ts`.
- **API key boundary**: `TMDB_API_KEY` is only accessible server-side (in `lib/tmdb.ts` via `process.env`). The API route acts as a proxy so the browser never sees the key.
- **External API boundary**: All TMDb communication happens through `lib/tmdb.ts` — a single module with one exported function.

## External dependencies

| Dependency | Purpose | Failure impact |
|---|---|---|
| TMDb API v3 (`api.themoviedb.org`) | Movie discovery data + agent movie metadata backbone | App shows "No movies found" — no fallback/cache |
| TMDb Image CDN (`image.tmdb.org`) | Movie poster images | Broken poster images, placeholder shown |
| Google Cloud Run | Hosting | App unavailable |
| Brave Search API (planned) | Box office agent web search for current grosses/rankings | Agent degrades to TMDb-only digest (see [ADR-0003](adr/ADR-0003-box-office-data-sourcing.md)) |
| Claude Agent SDK (planned) | Box office tracker agent runtime | Agent feature unavailable |
| Google Cloud Storage (planned) | Persist digest files for viewing and sharing | Digests not persisted — view only during request (see [ADR-0004](adr/ADR-0004-output-format-delivery.md)) |
