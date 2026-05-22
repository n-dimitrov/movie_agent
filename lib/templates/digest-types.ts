export interface TopMovie {
  id: number;
  title: string;
  releaseDate: string;
  posterPath: string;
  revenue: number;
  budget: number;
  rating: number;
  analysis: string;
}

export interface UpcomingMovie {
  id: number;
  title: string;
  releaseDate: string;
  posterPath: string;
  description: string;
}

export interface DigestData {
  generatedDate: string;
  topMovies: TopMovie[];
  upcomingMovies: UpcomingMovie[];
}
