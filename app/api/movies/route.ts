import { NextRequest, NextResponse } from "next/server";
import { getTopMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const yearStr = searchParams.get("year");
  const monthStr = searchParams.get("month");

  if (!yearStr || !monthStr) {
    return NextResponse.json(
      { error: "year and month are required" },
      { status: 400 }
    );
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json(
      { error: "Invalid year or month" },
      { status: 400 }
    );
  }

  try {
    const movies = await getTopMovies(year, month);
    return NextResponse.json(movies);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch movies from TMDb" },
      { status: 502 }
    );
  }
}
