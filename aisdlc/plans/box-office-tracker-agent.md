# Feature: Box Office Tracker Agent

**Status**: Completed
**Date**: 2026-05-22
**Completed**: 2026-05-22

## Prerequisites (completed)
- [x] ADR-0002: Agent Runtime Model — Next.js API route with TypeScript SDK
- [x] ADR-0003: Box Office Data Sourcing — Hybrid TMDb + agent web search
- [x] ADR-0004: Output Format & Delivery — GCS files, viewable in app + shareable links

## Key Constraint: Vertex AI Proxy

The Anthropic SDK must connect via the Bosch Vertex AI proxy, not the direct Anthropic API. SDK client is configured with:
- `ANTHROPIC_VERTEX_BASE_URL` — proxy endpoint
- `ANTHROPIC_AUTH_TOKEN` — proxy auth token (not Google OAuth)
- Standard `Anthropic` client with custom `baseURL` and `apiKey` mapped from these env vars

## Tasks

### Task 1 · devops-builder
**What**: Install dependencies — `@anthropic-ai/sdk`, `@google-cloud/storage`
**Pattern**: Existing `package.json` dependency management
**Outputs**: Updated `package.json` + `package-lock.json`

### Task 2 · backend-builder (depends on Task 1)
**What**: Create the agent tools — a TMDb tool (extends `lib/tmdb.ts` with now-playing, upcoming, movie details endpoints) and Claude's built-in web search tool (via SDK `server_tool` type). Fallback: external search API if built-in search doesn't work through Vertex proxy.
**Pattern**: Existing `lib/tmdb.ts` fetch + AbortController pattern
**Outputs**: `lib/tools/tmdb-tool.ts`, search tool config in agent setup

### Task 3 · backend-builder (depends on Task 2)
**What**: Create the agent orchestration — define the system prompt, tool definitions, and agent loop using `@anthropic-ai/sdk` configured for the Vertex AI proxy. Agent calls Claude with tools to produce a box office digest.
**Pattern**: Anthropic SDK tool-use pattern with custom baseURL
**Inputs**: Tools from Task 2, Vertex proxy env vars
**Outputs**: `lib/agent/boxoffice-agent.ts`

### Task 4 · backend-builder (can start after Task 1)
**What**: Create the GCS storage layer — upload digest files (HTML/JSON), generate signed URLs for sharing, list past digests
**Pattern**: Follows existing env var config pattern from `lib/tmdb.ts`
**Outputs**: `lib/storage/gcs.ts`

### Task 5 · backend-builder (depends on Tasks 3, 4)
**What**: Create the API routes — `POST /api/boxoffice` (trigger agent, save to GCS, return digest ID), `GET /api/boxoffice/[id]` (fetch digest from GCS), `GET /api/boxoffice` (list past digests)
**Pattern**: Existing `app/api/movies/route.ts` pattern
**Outputs**: `app/api/boxoffice/route.ts`, `app/api/boxoffice/[id]/route.ts`

### Task 6 · frontend-builder (depends on Task 5)
**What**: Create the Box Office UI — new page or section with "Generate Digest" button, digest viewer (newsletter-style), digest history list, and "Share" button that copies shareable link
**Pattern**: Existing component patterns from `components/`
**Outputs**: New page + components for digest display

### Task 7 · devops-builder (depends on Task 4)
**What**: Update deployment config — add env vars to `deploy.sh`, `service.yaml`, `.env` template. Create GCS bucket. Env vars: `ANTHROPIC_VERTEX_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `BRAVE_API_KEY`, `GCS_BUCKET_NAME`
**Pattern**: Existing `deploy.sh` env var pattern
**Outputs**: Updated deployment files

## Dependency graph

```
Task 1 [devops] — Install dependencies
  ├── Task 2 [backend] — Agent tools (TMDb + search)
  │    └── Task 3 [backend] — Agent orchestration (Vertex proxy)
  │         └── Task 5 [backend] — API routes (depends on 3 + 4)
  │              └── Task 6 [frontend] — Box Office UI
  └── Task 4 [backend] — GCS storage layer
       └── Task 7 [devops] — Deployment config
```

## Parallel tracks
- **Track A**: Task 1 → Task 2 → Task 3 → Task 5 → Task 6
- **Track B**: Task 1 → Task 4 → Task 7 (can run parallel with Track A after Task 1)
- Task 5 is the merge point — needs both Track A (Task 3) and Track B (Task 4)

## Environment variables (new)

| Variable | Purpose | Where |
|---|---|---|
| `ANTHROPIC_VERTEX_BASE_URL` | Bosch Vertex AI proxy endpoint | `.env`, `deploy.sh`, `service.yaml` |
| `ANTHROPIC_AUTH_TOKEN` | Proxy auth token | `.env`, `deploy.sh`, `service.yaml` |
| `ANTHROPIC_MODEL` | Claude model to use for digests (default: claude-opus-4-6) | `.env`, `deploy.sh`, `service.yaml` |
| `BRAVE_API_KEY` | Fallback search API key (only if Claude built-in search doesn't work via proxy) | `.env`, `deploy.sh`, `service.yaml` |
| `GCS_BUCKET_NAME` | Digest storage bucket name | `.env`, `deploy.sh`, `service.yaml` |
