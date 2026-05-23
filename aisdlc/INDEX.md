# Movie Discovery Agent

A web application for discovering popular movies from any month and year, powered by The Movie Database (TMDb) API. Users select a year/month (or hit "Random") and see the top 5 most popular movies from that period displayed as poster cards with hover overlays.

The app also includes a **Box Office Tracker Agent** that uses Claude to generate newsletter-style digests of current box office performance, combining TMDb data with web search to analyze trends, notable performances, and upcoming releases. Digests are stored in Google Cloud Storage and shareable via signed URLs.

## Quick context

- **Type**: Web app (single-page, client-rendered)
- **Stack**: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Database**: None — stateless, reads from TMDb API
- **Deployment**: Google Cloud Run (standalone Docker build, `gcloud run deploy`)
- **Repo structure**: Single service, flat layout
- **Phase**: Active development

## How to work in this codebase

### Load order (follow this sequence)

**1. Stable knowledge — always load before starting any task**
- `aisdlc/knowledge/architecture/overview.md` — system topology and key boundaries
- `aisdlc/knowledge/patterns/coding-patterns.md` — shared patterns all builders must follow

**2. Active memory — load after knowledge, before starting any task**
- `aisdlc/memory/patterns.md` — emergent patterns from recent sessions
- `aisdlc/memory/anti-patterns.md` — what has been tried and caused problems

**3. On demand — load only when relevant**
- `aisdlc/knowledge/architecture/adr/README.md` — before any architectural change
- `aisdlc/memory/learnings.md` — when debugging a recurring issue or uncertain about an approach
- `aisdlc/knowledge/domain.md` — when modeling new entities or business logic

**4. Never load proactively**
- `aisdlc/meta/run-log.jsonl` — raw data; only if asked to analyze run history

### Other rules
- Run `/aisdlc-architect` for any decision with multi-week implications
- Never write to `aisdlc/meta/run-log.jsonl` directly — always call `bash aisdlc/hooks/log-run.sh` with the three required arguments

## Key facts

1. The movie discovery feature is **stateless** — no database, no sessions, no user accounts. All data comes from TMDb API at request time.
2. The Box Office Tracker introduces **persistent storage** via Google Cloud Storage — digest files are stored as `{YYYYMMDD}.html` and auto-deleted after 90 days.
3. The TMDb API key is kept **server-side only** via Next.js API route (`app/api/movies/route.ts`) — the client never sees it.
4. The **Claude Agent SDK** connects via a Bosch Vertex AI proxy (not direct Anthropic API) — configured with `ANTHROPIC_VERTEX_BASE_URL` and `ANTHROPIC_AUTH_TOKEN`.
5. `next.config.ts` uses `output: "standalone"` for Docker/Cloud Run deployment — the build produces a self-contained `server.js`.
6. The movie discovery UI is a **single page** (`app/page.tsx`) with `"use client"` — all state lives in the Home component. Box Office UI is at `/boxoffice`.
7. Custom CSS variables in `globals.css` define a dark theme — Tailwind uses these via `@theme inline` (Tailwind v4 syntax).
8. The TMDb client (`lib/tmdb.ts`) has a **10-second abort timeout** on API calls.
9. `start.sh` sources `.env` before running `npm run dev` — always use it for local development to pick up API keys and env vars.

## Documentation map

| Want to understand... | Read... |
|---|---|
| System topology and data flows | `aisdlc/knowledge/architecture/overview.md` |
| Why Next.js / Cloud Run were chosen | `aisdlc/knowledge/architecture/adr/ADR-0001-existing-decisions.md` |
| Component breakdown | `aisdlc/knowledge/components/README.md` |
| How errors are handled | `aisdlc/knowledge/patterns/coding-patterns.md#error-handling` |
| Recent session learnings | `aisdlc/memory/learnings.md` |
| Approaches to avoid | `aisdlc/memory/anti-patterns.md` |

## Commands

```bash
./start.sh              # Dev server (sources .env, runs next dev)
npm run dev              # Dev server (requires env vars from .env)
npm run build            # Production build (standalone output)
npm run lint             # ESLint
./deploy.sh              # Deploy to Cloud Run (sources .env for secrets)

# Box Office Digest Generation
./scripts/generate-digest.sh                    # Generate digest (local dev server)
./scripts/generate-digest.sh https://your-url  # Generate digest (deployed)

# Access points (in dev or deployed):
# /                      # Movie Discovery UI
# /boxoffice             # Box Office Tracker Agent UI
```

## Directory map

```
movie_agent/
├── app/                # Next.js App Router — pages, layouts, API routes
│   ├── api/movies/     # Server-side TMDb proxy endpoint
│   ├── page.tsx        # Main (only) page — movie discovery UI
│   └── layout.tsx      # Root layout with Inter font + dark theme
├── components/         # React components — Header, MovieGrid, MovieCard
├── lib/                # Shared utilities — TMDb API client
├── public/             # Static assets
├── deploy.sh           # Cloud Run deployment script
├── Dockerfile          # Multi-stage build for standalone Next.js
├── service.yaml        # Cloud Run Knative service config
└── aisdlc/             # All project knowledge and self-evolving memory
    ├── knowledge/      # Stable: architecture, patterns, components, domain
    ├── memory/         # Evolving: learnings, patterns, anti-patterns
    ├── meta/           # Audit: run logs, usage stats, evolution history
    └── hooks/          # Automation: log-run, extract-learning, summarize-failure
```
