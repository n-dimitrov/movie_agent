export interface TopMovie {
  id: number;
  title: string;
  releaseDate: string;
  posterPath: string;
  revenue: number;
  budget: number;
  rating: number;
  overview: string;
  director?: string;
  cast?: string[];
  gross?: number;
  grossLabel?: string;
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
  director?: string;
  cast?: string[];
}

export interface DigestData {
  generatedDate: string;
  topMovies: TopMovie[];
  upcomingMovies: UpcomingMovie[];
}
