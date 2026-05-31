export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
  revenue?: number;
}

interface TMDbResponse {
  results: Movie[];
}

interface TMDbCastMember {
  name: string;
  character: string;
  order: number;
}

interface TMDbCrewMember {
  name: string;
  job: string;
}

interface TMDbMovieDetailsResponse extends Movie {
  budget: number;
  revenue: number;
  status: string;
  credits?: {
    cast: TMDbCastMember[];
    crew: TMDbCrewMember[];
  };
}

async function tmdbFetch(endpoint: string, params: URLSearchParams): Promise<any> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not configured");

  params.set("api_key", apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3${endpoint}?${params}`,
      { signal: controller.signal }
    );

    if (!res.ok) {
      throw new Error(`TMDb API returned ${res.status}`);
    }

    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
  const params = new URLSearchParams({
    page: "1",
    region: "US",
  });

  const data: TMDbResponse = await tmdbFetch("/movie/now_playing", params);
  return data.results.slice(0, 20);
}

export async function getUpcomingMovies(): Promise<Movie[]> {
  const params = new URLSearchParams({
    page: "1",
    region: "US",
  });

  const data: TMDbResponse = await tmdbFetch("/movie/upcoming", params);
  return data.results.slice(0, 20);
}

export async function getMovieDetails(movieId: number): Promise<TMDbMovieDetailsResponse> {
  const params = new URLSearchParams({
    append_to_response: "credits",
  });
  const data: TMDbMovieDetailsResponse = await tmdbFetch(`/movie/${movieId}`, params);
  return data;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const params = new URLSearchParams({
    query,
    page: "1",
  });

  const data: TMDbResponse = await tmdbFetch("/search/movie", params);
  return data.results.slice(0, 10);
}
