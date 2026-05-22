import type { Movie } from "@/lib/tmdb";
import { MovieCard } from "./movie-card";

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl overflow-hidden animate-pulse">
      <div className="w-full aspect-[2/3] bg-surface-hover" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-surface-hover rounded w-3/4" />
        <div className="h-3 bg-surface-hover rounded w-1/2" />
      </div>
    </div>
  );
}

export function MovieGrid({
  movies,
  loading,
  hasSearched,
}: {
  movies: Movie[];
  loading: boolean;
  hasSearched: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center text-muted py-24">
        <div className="text-5xl mb-4">🎬</div>
        <p>Select a year and month, then click <strong>Get Movies</strong></p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center text-muted py-24">
        <div className="text-5xl mb-4">🔍</div>
        <p>No movies found for this period.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
