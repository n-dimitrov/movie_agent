import data from "./project21.json";

export interface SprintMovie {
  sprint: number;
  sprintTitle: string;
  tmdbId: number;
  title: string;
  year: number | null;
  releaseDate: string | null;
  runtime: number | null;
  rating: number | null;
  voteCount: number;
  tagline: string | null;
  overview: string;
  genres: string[];
  directors: string[];
  cast: string[];
  posterPath: string | null;
  backdropPath: string | null;
}

export const PROJECT21: SprintMovie[] = data as SprintMovie[];

export const TMDB_IMG = "https://image.tmdb.org/t/p";
