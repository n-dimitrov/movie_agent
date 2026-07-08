export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface TMDbResponse {
  results: Movie[];
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export async function getTopMovies(
  year: number,
  month: number
): Promise<Movie[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not configured");

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDay = daysInMonth(year, month);
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

  const params = new URLSearchParams({
    api_key: apiKey,
    "primary_release_date.gte": startDate,
    "primary_release_date.lte": endDate,
    sort_by: "popularity.desc",
    "vote_count.gte": "50",
    include_adult: "false",
    page: "1",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?${params}`,
      { signal: controller.signal }
    );

    if (!res.ok) {
      throw new Error(`TMDb API returned ${res.status}`);
    }

    const data: TMDbResponse = await res.json();
    return data.results.slice(0, 5);
  } finally {
    clearTimeout(timeout);
  }
}
