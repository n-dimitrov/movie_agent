# Movie Discovery Agent

A web application for discovering popular movies from any month and year, powered by The Movie Database (TMDb) API.

## Features

- **Time-based Discovery** — Find the top 5 most popular movies from any month and year
- **Random Discovery** — Get surprised with movies from a random time period
- **Rich Movie Cards** — Poster grid with hover overlays showing ratings, dates, and overviews
- **Responsive Design** — Grid adapts from mobile to desktop
- **Year Range Configuration** — Customizable year range (default: 1978 – current year)
- **Secure API Key** — TMDb key stays server-side, never exposed to the browser

## Tech Stack

- **Next.js** (App Router, TypeScript)
- **Tailwind CSS**
- **TMDb API v3**

## Getting Started

### Prerequisites

- Node.js 20+
- TMDb API key ([themoviedb.org](https://www.themoviedb.org/))

### Installation

```bash
git clone https://github.com/n-dimitrov/movie_agent.git
cd movie_agent
npm install
```

### Configuration

Create a `.env` file in the project root:

```
TMDB_API_KEY=your_tmdb_api_key_here
```

### Running the App

```bash
./start.sh
```

Or manually:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## How to Use

1. Select a year and month from the dropdowns
2. Click **Get Movies** to see the top 5 popular movies from that period
3. Click **Random** for surprise recommendations
4. Hover over a movie card to see its overview
5. Adjust the year range in the header controls

## License

This project is open source and available under the [MIT License](LICENSE).
