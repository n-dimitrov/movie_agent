# Movies API Route

**Location**: `app/api/movies/route.ts`
**Status**: Active

## Purpose

Server-side API endpoint that acts as a proxy between the client UI and the TMDb API. Validates query parameters and keeps the TMDb API key secret from the browser.

## Public interface

- `GET /api/movies?year=YYYY&month=M` — returns `Movie[]` JSON (top 5 by popularity)

## Dependencies

**Depends on:**
- `lib/tmdb.ts` — `getTopMovies()` function

**Depended on by:**
- `app/page.tsx` — client-side fetch in the `fetchMovies` callback

## Key implementation notes

- Validates that both `year` and `month` query params are present and numeric
- Returns 400 for missing/invalid params, 502 for upstream TMDb failures
- No authentication or rate limiting on this endpoint — it's public
- Uses Next.js `NextRequest`/`NextResponse` from `next/server`

## Related ADRs

- [ADR-0001](../architecture/adr/ADR-0001-existing-decisions.md) — Decision 3: TMDb as sole data source
