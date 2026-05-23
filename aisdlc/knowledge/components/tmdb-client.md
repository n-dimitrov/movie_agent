# TMDb Client

**Location**: `lib/tmdb.ts`
**Status**: Active

## Purpose

Server-side client that proxies movie discovery requests to the TMDb API v3. Keeps the API key out of client-side code and provides a typed interface for movie data.

## Public interface

- `getTopMovies(year: number, month: number): Promise<Movie[]>` — returns top 5 movies by popularity for the given month/year
- `Movie` (type export) — `{ id, title, overview, poster_path, release_date, vote_average }`

## Dependencies

**Depends on:**
- TMDb API v3 (`https://api.themoviedb.org/3/discover/movie`) — movie data source
- `TMDB_API_KEY` environment variable — authentication

**Depended on by:**
- `app/api/movies/route.ts` — the API route that calls `getTopMovies`

## Key implementation notes

- Uses `AbortController` with a 10-second timeout — requests that exceed this are aborted
- Always returns exactly 5 movies (`.slice(0, 5)`) from page 1 of TMDb results sorted by popularity descending
- Date range is constructed from year/month params: first day to last day of the month
- The `daysInMonth` helper uses `new Date(year, month, 0).getDate()` to calculate month length
