import { getNowPlayingMovies, getUpcomingMovies, getMovieDetails, searchMovies, getBoxOffice, type BoxOfficeMode } from "../tools";
import { DigestData, TopMovie } from "../templates/digest-types";
import { renderDigest } from "../templates/digest-template";

async function generateFromTheNumbers(mode: BoxOfficeMode): Promise<TopMovie[]> {
  const entries = await getBoxOffice(mode);
  if (entries.length === 0) throw new Error("No box office entries found");

  const topMovies: TopMovie[] = await Promise.all(
    entries.slice(0, 10).map(async (entry) => {
      let id = 0;
      let posterPath = "";
      let overview = "";
      let rating = 0;
      let budget = 0;
      let revenue = 0;
      let releaseDate = "";
      let director = "";
      let cast: string[] = [];

      try {
        const results = await searchMovies(entry.title);
        if (results.length > 0) {
          const match = results[0];
          id = match.id;
          posterPath = match.poster_path ?? "";
          overview = match.overview;
          rating = match.vote_average;
          releaseDate = match.release_date;

          try {
            const details = await getMovieDetails(match.id);
            budget = details.budget ?? 0;
            revenue = details.revenue ?? 0;
            director = details.credits?.crew.find(c => c.job === "Director")?.name ?? "";
            cast = details.credits?.cast.slice(0, 3).map(c => c.name) ?? [];
          } catch {}
        }
      } catch {}

      return {
        id,
        title: entry.title,
        releaseDate,
        posterPath,
        revenue,
        budget,
        rating,
        overview,
        director: director || undefined,
        cast: cast.length > 0 ? cast : undefined,
        gross: entry.gross,
        grossLabel: mode === "weekly" ? "Weekly" : "Daily",
        theaters: entry.theaters,
        theaterAverage: entry.theaterAverage,
        totalGross: entry.totalGross,
        daysInRelease: entry.daysInRelease,
      };
    })
  );

  return topMovies;
}

async function generateFromTMDb(): Promise<TopMovie[]> {
  const nowPlaying = await getNowPlayingMovies();

  const detailed = await Promise.all(
    nowPlaying.map(async (movie) => {
      try {
        return await getMovieDetails(movie.id);
      } catch {
        return { ...movie, budget: 0, revenue: 0, status: "Unknown", credits: undefined };
      }
    })
  );

  return detailed
    .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
    .slice(0, 10)
    .map((m) => ({
      id: m.id,
      title: m.title,
      releaseDate: m.release_date,
      posterPath: m.poster_path ?? "",
      revenue: m.revenue ?? 0,
      budget: m.budget ?? 0,
      director: m.credits?.crew.find(c => c.job === "Director")?.name || undefined,
      cast: m.credits?.cast.slice(0, 3).map(c => c.name) || undefined,
      rating: m.vote_average,
      overview: m.overview,
    }));
}

export async function generateBoxOfficeDigest(mode: BoxOfficeMode = "weekly"): Promise<{ data: DigestData; html: string }> {
  let topMovies: TopMovie[];

  try {
    topMovies = await generateFromTheNumbers(mode);
  } catch (err) {
    console.warn("The Numbers scrape failed, falling back to TMDb:", err);
    topMovies = await generateFromTMDb();
  }

  const upcoming = await getUpcomingMovies();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingFiltered = upcoming
    .filter((m) => {
      const release = new Date(m.release_date);
      return release >= today && release <= nextWeek;
    })
    .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());

  const upcomingMovies = await Promise.all(
    upcomingFiltered.map(async (m) => {
      let director: string | undefined;
      let cast: string[] | undefined;
      try {
        const details = await getMovieDetails(m.id);
        director = details.credits?.crew.find(c => c.job === "Director")?.name || undefined;
        cast = details.credits?.cast.slice(0, 3).map(c => c.name);
        if (cast?.length === 0) cast = undefined;
      } catch {}
      return {
        id: m.id,
        title: m.title,
        releaseDate: m.release_date,
        posterPath: m.poster_path ?? "",
        overview: m.overview,
        director,
        cast,
      };
    })
  );

  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const digestData: DigestData = { generatedDate, topMovies, upcomingMovies };
  return { data: digestData, html: renderDigest(digestData) };
}
