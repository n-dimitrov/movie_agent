# Movie Discovery UI

**Location**: `app/page.tsx`, `components/`
**Status**: Active

## Purpose

Single-page client-side UI for discovering movies by month/year. Manages all user interaction state (selected date, loading, results) and renders movie results as a responsive poster grid.

## Public interface

- `Home` (default export from `app/page.tsx`) — main page component, manages all state
- `Header` (`components/header.tsx`) — year/month selectors, Get Movies + Random buttons, year range config
- `MovieGrid` (`components/movie-grid.tsx`) — renders movie cards, skeleton loading, and empty states
- `MovieCard` (`components/movie-card.tsx`) — poster card with hover overlay showing rating, date, overview

## Dependencies

**Depends on:**
- `lib/tmdb.ts` — `Movie` type (not the function — data is fetched via API route)
- `/api/movies` — server-side API route for data
- `image.tmdb.org` — poster images loaded directly by `<Image>` component

**Depended on by:**
- Nothing — this is the top-level UI

## Key implementation notes

- `app/page.tsx` is `"use client"` — all state is local `useState`, no server-side data fetching
- The Random button generates a year within `[minYear, maxYear]` and a random month, then triggers the same fetch flow
- `MovieCard` uses absolute-positioned overlay (`opacity-0 → group-hover:opacity-100`) for the hover detail view
- `MovieGrid` has three states: initial (emoji + instructions), loading (5 skeleton cards), results (movie cards)
- Year range defaults to 1978–current year, configurable via number inputs in the header

## Related ADRs

- [ADR-0001](../architecture/adr/ADR-0001-existing-decisions.md) — Decision 2: client-side rendering rationale
