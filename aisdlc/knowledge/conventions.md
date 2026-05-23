# Conventions

Cross-cutting conventions for this project. Applies to all builder roles.

## Naming conventions

- **Files**: kebab-case for components (`movie-card.tsx`), kebab-case for libs (`tmdb.ts`)
- **Components**: PascalCase named exports (`MovieCard`, `MovieGrid`, `Header`)
- **Functions**: camelCase (`getTopMovies`, `fetchMovies`, `handleSearch`)
- **Types/Interfaces**: PascalCase (`Movie`, `TMDbResponse`)
- **CSS variables**: kebab-case with semantic names (`--surface`, `--accent`, `--muted`)

## Code style

- TypeScript strict mode enabled
- Inline prop types at function parameters (not separate `Props` interfaces)
- Named exports for components (not default exports), except `app/page.tsx` which uses default export per Next.js convention
- `"use client"` directive for interactive components
- No semicolons: [VERIFY] — eslint config uses `eslint-config-next` defaults, could not confirm semicolon preference from code (code has semicolons)
- Tailwind utility classes for all styling — no CSS modules or styled-components

## Commit and PR conventions

- Commit messages are imperative, descriptive (`Add Cloud Run deployment setup`, `Refactor from Streamlit to Next.js`)
- [VERIFY] No PR template or conventional commits enforced — confirm if there's a preferred style
