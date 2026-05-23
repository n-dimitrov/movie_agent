import { NextResponse } from "next/server";
import { getUpcomingMovies } from "@/lib/tools";

export async function GET() {
  try {
    const movies = await getUpcomingMovies();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcoming = movies
      .filter((m) => {
        const release = new Date(m.release_date);
        return release >= today && release <= nextWeek;
      })
      .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
      .map((m) => ({
        id: m.id,
        title: m.title,
        releaseDate: m.release_date,
        posterPath: m.poster_path,
        rating: m.vote_average,
        overview: m.overview,
      }));

    return NextResponse.json(upcoming);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch upcoming movies",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
