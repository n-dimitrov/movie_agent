# ADR-0001: Existing Architectural Decisions

**Status:** Accepted
**Date:** 2026-05-22 (documented retroactively)

## Context

These decisions were already made when this project was built. They are documented here for reference, not as proposals.

---

## Decision 1: Next.js with App Router

**Choice:** Next.js 16 with the App Router (not Pages Router).

**Rationale:** [VERIFY] — Could not determine original rationale from code. Likely chosen for modern React 19 support, built-in API routes, and image optimization.

**Consequences:**
- API routes live alongside pages in `app/api/`
- Server/client boundary is explicit via `"use client"` directive
- Standalone output mode enables Docker deployment without full `node_modules`

---

## Decision 2: Client-side rendering for the main page

**Choice:** The main page (`app/page.tsx`) uses `"use client"` — all UI state and data fetching happen client-side.

**Rationale:** The app is interactive (dropdowns, random button, loading states). SSR would add complexity for no SEO benefit since this is a discovery tool, not content.

**Consequences:**
- No server-side data fetching on page load — the page renders empty until the user acts
- All state management is local `useState` — simple but doesn't scale to multi-page scenarios
- No SEO for movie content (acceptable for a discovery tool)

---

## Decision 3: TMDb API as sole data source (no database)

**Choice:** Stateless architecture — no database, no caching, all data fetched from TMDb on every request.

**Rationale:** The app is a simple discovery tool with no user accounts, no saved preferences, no content to persist.

**Consequences:**
- Zero operational complexity for data storage
- Every request incurs TMDb API latency (~200-500ms)
- No resilience to TMDb outages — app is fully dependent
- TMDb API rate limits apply directly to users

---

## Decision 4: Google Cloud Run for deployment

**Choice:** Deploy as a Docker container on Cloud Run with `gcloud run deploy --source`.

**Rationale:** [VERIFY] — Could not determine original rationale from code. Likely chosen for scale-to-zero cost model and simple container deployment.

**Consequences:**
- Scale-to-zero means no cost when idle (min instances = 0)
- Cold starts possible — mitigated with `startup-cpu-boost: true`
- Secrets managed via `--set-env-vars` in deploy script, not Secret Manager
- Container image stored in Artifact Registry (`us-central1-docker.pkg.dev/apa-bd/cloud-run-source-deploy/movie-agent`)

---

## Decision 5: Dark theme with custom CSS variables

**Choice:** Custom CSS variables in `globals.css` mapped to Tailwind via `@theme inline` (Tailwind v4 syntax).

**Rationale:** Provides a consistent dark cinema aesthetic. Using CSS variables allows theme changes without touching component code.

**Consequences:**
- No light mode support — dark only
- Theme colors are referenced as Tailwind utilities (`bg-surface`, `text-muted`, etc.)
- Adding light mode would require adding a toggle mechanism and corresponding variable overrides
