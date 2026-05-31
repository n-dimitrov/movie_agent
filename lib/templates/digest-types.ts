export interface TopMovie {
  id: number;
  title: string;
  releaseDate: string;
  posterPath: string;
  revenue: number;
  budget: number;
  rating: number;
  overview: string;
  dailyGross?: number;
  theaters?: number;
  theaterAverage?: number;
  totalGross?: number;
  daysInRelease?: number;
}

export interface UpcomingMovie {
  id: number;
  title: string;
  releaseDate: string;
  posterPath: string;
  overview: string;
}

export interface DigestData {
  generatedDate: string;
  topMovies: TopMovie[];
  upcomingMovies: UpcomingMovie[];
}
