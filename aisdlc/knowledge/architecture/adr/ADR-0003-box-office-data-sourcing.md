# ADR-0003: Box Office Data Sourcing Strategy

**Date**: 2026-05-22
**Status**: Accepted
**Deciders**: Solo (with Claude architect assist)

---

## Context

The Box Office Tracker Agent feature requires current box office data — weekend grosses, rankings, opening weekends, and trend analysis. The existing app is a stateless Next.js web app that uses only the TMDb API for movie discovery data. TMDb provides movie metadata and posters but lacks weekend-by-weekend box office breakdowns.

The primary data sources mentioned in the feature brief — Box Office Mojo and The Numbers — do not offer public APIs. Accessing their data programmatically requires web scraping, which is fragile (layouts change), legally questionable (ToS restrictions), and adds significant maintenance burden for a personal project.

The Claude Agent SDK, which will power the agent, is designed around tool use — giving the agent callable tools and letting it decide how to orchestrate them. This creates an opportunity to let the agent itself handle unstructured data retrieval rather than building brittle scrapers.

Without a decision on data sourcing, no implementation tasks can be scoped — the data source shapes the data model, the agent's tool set, the update cadence, and the output format.

---

## Decision

**Use a hybrid approach: TMDb API as the structural backbone for movie metadata and posters, combined with a web search tool for the Claude agent to retrieve current box office performance data.**

TMDb provides reliable, structured data for "what movies are out" — now playing lists, upcoming releases, movie details, poster images. This extends the existing `lib/tmdb.ts` integration with minimal new code.

For box office numbers (weekend grosses, rankings, opening comparisons), the Claude agent uses its built-in web search capability (via SDK `server_tool` type) to find and synthesize current box office data from multiple sources. Claude handles the parsing and cross-referencing natively — no HTML scraper to maintain. If built-in search is unavailable through the Vertex proxy, an external search API (e.g., Brave Search) serves as a fallback.

This was chosen over pure web scraping (Option A) because scrapers against Box Office Mojo and The Numbers break frequently and carry legal risk. It was chosen over TMDb-only (Option B) because TMDb's revenue data is lifetime totals only — no weekend breakdowns, no domestic/international splits, making real box office analysis impossible. It was chosen over pure web search (Option C) because TMDb provides a reliable structural backbone that ensures the agent always has quality movie metadata even when search results are poor.

---

## Consequences

### Positive
- Extends existing TMDb integration (`lib/tmdb.ts`) — no new API client infrastructure needed for the movie data backbone
- Zero scraper maintenance — Claude handles unstructured web content naturally
- Graceful degradation — if search API is down, agent still produces a useful digest from TMDb data alone
- Agent can cross-reference multiple web sources for accuracy rather than depending on a single scraped site
- Aligns with Claude Agent SDK's tool-use design pattern

### Negative / Trade-offs
- Requires a search API subscription (Brave Search API free tier: 2,000 queries/month — sufficient for weekly digests)
- Less deterministic than a structured API — same search may yield different quality results on different days
- Two data paths (TMDb tool + search tool) add moderate complexity to agent tool configuration
- Box office numbers are only as good as what the search finds — no guaranteed data completeness

### Risks and mitigations
- **Risk**: Search API returns poor or irrelevant results for box office queries
  **Mitigation**: Agent prompt engineering to use specific search queries ("domestic box office weekend results [date]"). Fallback to TMDb-only digest if search quality is low.
- **Risk**: Search API cost increases or free tier is removed
  **Mitigation**: Brave Search free tier is generous for this use case. Alternative search APIs (SerpAPI, Google Custom Search) exist as drop-in replacements since the agent just needs a "search" tool.
- **Risk**: Box office data accuracy — web sources may conflict
  **Mitigation**: Agent can be prompted to note confidence level and cite sources. For a personal digest tool, approximate numbers are acceptable.

---

## Options considered

### Option A: Web Scraping Box Office Mojo / The Numbers
Most complete data, but requires HTML parsing (Cheerio/Puppeteer), breaks when site layouts change, likely violates ToS, and adds significant container size for Cloud Run. Rejected due to maintenance burden and legal risk.

### Option B: TMDb API Revenue Data Only
Zero new dependencies, but TMDb only has lifetime total revenue — no weekend breakdowns, no domestic/international splits. Data is community-contributed and often delayed. Rejected because it cannot support the core feature (box office trend analysis).

### Option C: Claude Agent with Web Search Only (No TMDb backbone)
Simplest architecture — agent searches for everything. Rejected because it loses the reliable structural backbone TMDb provides. When search results are poor, the agent has nothing to fall back on.

### Option D: Hybrid — TMDb + Agent Web Search (Chosen)
Combines reliable structured data (TMDb) with flexible unstructured data retrieval (search). Best balance of reliability, maintainability, and data richness.

---

## Revisit triggers

This decision should be revisited if:
- A free, reliable box office API becomes available (e.g., TMDb adds weekend gross data, or a new service launches) — would simplify the architecture by replacing the search tool
- Search API costs exceed $20/month — would need to evaluate cheaper alternatives or reduce query frequency
- Agent consistently produces inaccurate box office data due to poor search results — would need to consider a structured data source or manual curation
