# Domain Model

Ubiquitous language and core domain concepts for this project.

## Core entities

### Movie
The central entity. Represents a film from TMDb's database.

| Field | Type | Description |
|---|---|---|
| `id` | `number` | TMDb unique identifier |
| `title` | `string` | Movie title |
| `overview` | `string` | Plot summary |
| `poster_path` | `string \| null` | Path segment for poster image URL |
| `release_date` | `string` | Release date in `YYYY-MM-DD` format |
| `vote_average` | `number` | Average user rating (0-10) |

## Key relationships

- **Discovery period** → **Movies**: A year+month combination maps to a set of movies released in that date range
- **Movie** → **Poster**: A movie's `poster_path` resolves to a full URL via `https://image.tmdb.org/t/p/w400{poster_path}`

## Domain rules and invariants

- A discovery query always returns **at most 5** movies, sorted by popularity descending
- The year range for discovery is configurable, defaulting to **1978 – current year**
- Month is 1-indexed (1 = January, 12 = December)
- Movies without a poster show a placeholder emoji

## Glossary

| Term | Meaning |
|---|---|
| Discovery | Finding popular movies from a specific month/year period |
| Random | Selecting a random year (within range) and month, then discovering movies for it |
| Year Range | User-configurable bounds (`minYear` to `maxYear`) for the year dropdown and random selection |
| Poster path | The relative URL segment from TMDb that, combined with the image CDN base, produces a poster URL |
