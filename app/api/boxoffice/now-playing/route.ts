import { NextResponse } from "next/server";
import { getNowPlayingMovies, getMovieDetails } from "@/lib/tools";

export async function GET() {
  try {
    const movies = await getNowPlayingMovies();

    const detailed = await Promise.all(
      movies.map(async (movie) => {
        try {
          return await getMovieDetails(movie.id);
        } catch {
          return { ...movie, budget: 0, revenue: 0, status: "Unknown" };
        }
      })
    );

    const top5 = detailed
      .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
      .slice(0, 10)
      .map((m) => ({
        id: m.id,
        title: m.title,
        releaseDate: m.release_date,
        posterPath: m.poster_path,
        revenue: m.revenue ?? 0,
        budget: m.budget ?? 0,
        rating: m.vote_average,
        overview: m.overview,
      }));

    return NextResponse.json(top5);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch now-playing movies",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
