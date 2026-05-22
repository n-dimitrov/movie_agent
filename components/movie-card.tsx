import Image from "next/image";
import type { Movie } from "@/lib/tmdb";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="group relative bg-surface rounded-xl overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(99,102,241,0.2)]">
      {movie.poster_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/w400${movie.poster_path}`}
          alt={movie.title}
          width={400}
          height={600}
          className="w-full aspect-[2/3] object-cover"
        />
      ) : (
        <div className="w-full aspect-[2/3] bg-surface-hover flex items-center justify-center text-5xl text-muted">
          🎬
        </div>
      )}

      <div className="p-3">
        <div className="text-sm font-semibold truncate">{movie.title}</div>
        <div className="flex justify-between text-xs text-muted mt-1">
          <span className="text-gold">⭐ {movie.vote_average.toFixed(1)}</span>
          <span>{movie.release_date ? formatDate(movie.release_date) : "Unknown"}</span>
        </div>
      </div>

      <div className="absolute inset-0 bg-[rgba(15,15,15,0.92)] p-5 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250">
        <div className="text-lg font-bold mb-2">{movie.title}</div>
        <div className="flex gap-4 text-xs text-muted mb-3">
          <span className="text-gold">⭐ {movie.vote_average.toFixed(1)}</span>
          <span>{movie.release_date ? formatDate(movie.release_date) : "Unknown"}</span>
        </div>
        <p className="text-sm text-[#bbb] leading-relaxed line-clamp-6">
          {movie.overview || "No overview available."}
        </p>
      </div>
    </div>
  );
}
