# ADR-0002: Agent Runtime Model

**Date**: 2026-05-22
**Status**: Accepted
**Deciders**: Solo (with Claude architect assist)

---

## Context

The Box Office Tracker Agent feature (see ADR-0003 for data sourcing) needs a runtime home. The agent uses the Claude Agent SDK with two tools — a TMDb API client and a web search tool — to produce box office digest reports.

The existing project is a TypeScript-only Next.js 16 app deployed on Cloud Run via a standalone Docker build. It has a working TMDb client in `lib/tmdb.ts`, a deployment pipeline in `deploy.sh`, and a Cloud Run service configuration in `service.yaml`. The Anthropic SDK is available in both Python and TypeScript.

For a personal project, minimizing operational complexity is more important than architectural purity. Adding new languages, deployment pipelines, or infrastructure services increases the maintenance burden disproportionately. The agent needs to be triggerable on demand (via UI or API call) and eventually on a schedule.

---

## Decision

**Run the box office agent as a Next.js API route using the `@anthropic-ai/sdk` TypeScript SDK (configured for the Bosch Vertex AI proxy), within the existing application.**

The agent lives at a new API route (e.g., `app/api/boxoffice/route.ts`). It uses the TypeScript Anthropic SDK to orchestrate the agent with two tools: a TMDb tool (extending the existing `lib/tmdb.ts` client) and a web search tool (Brave Search API). The route returns the completed digest as a response.

The SDK connects to Claude via a Vertex AI-compatible proxy at `ANTHROPIC_VERTEX_BASE_URL`, authenticated with `ANTHROPIC_AUTH_TOKEN` (not standard Google OAuth or direct Anthropic API key). This is configured via environment variables — the agent code itself is proxy-agnostic.

This was chosen because it adds zero new infrastructure — same language, same repo, same Docker image, same Cloud Run deployment. The existing TMDb client is reusable as an agent tool without rewriting. On-demand triggering is a simple HTTP call from the frontend or via Cloud Scheduler for automated runs.

The main alternative — a standalone Python script — was rejected because it introduces a second language and dependency system into a TypeScript-only project, requires a separate deployment pipeline, and cannot reuse the existing TMDb client. A separate Cloud Run Job was rejected as premature infrastructure for a personal project.

---

## Consequences

### Positive
- Zero new infrastructure — extends the existing Next.js app and Cloud Run deployment
- Reuses `lib/tmdb.ts` as the TMDb agent tool — no client rewrite
- Same TypeScript language across the entire project
- On-demand triggering via HTTP — easy to connect to UI button or Cloud Scheduler
- Agent logic (tools + prompt) remains portable — can be extracted to a standalone service later if needed

### Negative / Trade-offs
- Agent runs within a request-response cycle — bounded by Cloud Run request timeout (configurable, default 300s)
- Mixes a potentially long-running agent concern with a web app designed for fast responses
- TypeScript Agent SDK has fewer community examples than the Python SDK
- Single deployment unit means agent issues (e.g., high memory from large responses) could affect the web app

### Risks and mitigations
- **Risk**: Agent exceeds Cloud Run request timeout
  **Mitigation**: Configure timeout to 600s in `service.yaml`. A box office digest should complete well within this. If it doesn't, upgrade to streaming response (SSE) which supports up to 60 minutes on Cloud Run.
- **Risk**: Agent memory/CPU spikes affect web app performance
  **Mitigation**: Cloud Run scales instances independently. Under normal load, agent requests get their own instance. Monitor and split into a separate service only if this becomes a real problem.
- **Risk**: TypeScript SDK lacks agent features available in Python SDK
  **Mitigation**: The core agent loop (tool use, message passing) is fully supported in the TypeScript SDK. Advanced features like multi-agent orchestration are not needed for this use case.

---

## Options considered

### Option A: Standalone Python Script
Most mature SDK support, clean separation from web app. Rejected because it introduces Python into a TypeScript-only project, requires a separate deployment pipeline, and cannot reuse the existing TMDb client in `lib/tmdb.ts`.

### Option B: Next.js API Route with TypeScript SDK (Chosen)
Same stack, same deployment, reuses existing code. Accepted for zero-infrastructure simplicity and natural fit with the existing project structure.

### Option C: Separate Cloud Run Job
Purpose-built for batch/scheduled tasks with no timeout concerns. Rejected as premature infrastructure — adds a new deployment pipeline and makes on-demand triggering harder. Can revisit if the agent needs to run longer than Cloud Run request limits allow.

### Option D: Next.js API Route with Streaming (SSE)
Same as Option B but with streaming response for real-time progress and longer execution. Not chosen initially — adds frontend complexity. Identified as a natural upgrade path if timeout or UX requires it.

---

## Revisit triggers

This decision should be revisited if:
- Agent consistently times out at 600s on Cloud Run — consider upgrading to streaming (Option D) or extracting to a Cloud Run Job (Option C)
- Agent memory/CPU usage degrades web app performance under concurrent load — consider splitting into a separate Cloud Run service
- A second agent is added to the project — at that point, a shared agent infrastructure (separate service or framework) may justify the overhead
