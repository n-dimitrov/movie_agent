# Ownership

Who owns what — teams, services, and areas of the codebase.

## Team / role assignments

| Area | Owner | Notes |
|---|---|---|
| Entire project | Niki Dimitrov | Solo developer / personal project |

## Shared / high-blast-radius areas

- `lib/tmdb.ts` — single data access module; changes affect both API route and type exports
- `globals.css` — theme variables used by every component
- `next.config.ts` — standalone output + image domain config; changes affect build and deployment
