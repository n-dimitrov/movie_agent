import { getNowPlayingMovies, getUpcomingMovies, getMovieDetails } from "../tools";
import { DigestData } from "../templates/digest-types";
import { renderDigest } from "../templates/digest-template";

export async function generateBoxOfficeDigest(): Promise<string> {
  const [nowPlaying, upcoming] = await Promise.all([
    getNowPlayingMovies(),
    getUpcomingMovies(),
  ]);

  const detailed = await Promise.all(
    nowPlaying.map(async (movie) => {
      try {
        return await getMovieDetails(movie.id);
      } catch {
        return { ...movie, budget: 0, revenue: 0, status: "Unknown" };
      }
    })
  );

  const topMovies = detailed
    .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
    .slice(0, 10)
    .map((m) => ({
      id: m.id,
      title: m.title,
      releaseDate: m.release_date,
      posterPath: m.poster_path ?? "",
      revenue: m.revenue ?? 0,
      budget: m.budget ?? 0,
      rating: m.vote_average,
      overview: m.overview,
    }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingMovies = upcoming
    .filter((m) => {
      const release = new Date(m.release_date);
      return release >= today && release <= nextWeek;
    })
    .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
    .map((m) => ({
      id: m.id,
      title: m.title,
      releaseDate: m.release_date,
      posterPath: m.poster_path ?? "",
      overview: m.overview,
    }));

  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const digestData: DigestData = { generatedDate, topMovies, upcomingMovies };
  return { data: digestData, html: renderDigest(digestData) };
}
