import { DigestData, TopMovie, UpcomingMovie } from "./digest-types";

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function posterUrl(posterPath: string): string {
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

function tmdbUrl(id: number): string {
  return `https://www.themoviedb.org/movie/${id}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTopMovie(movie: TopMovie, rank: number): string {
  return `
    <div class="movie-card" style="margin-bottom:24px;background:#1e1e2e;border-radius:12px;border:1px solid #2a2a3e;overflow:hidden;">
      <div style="display:flex;gap:20px;padding:20px;">
        <div class="poster" style="flex-shrink:0;position:relative;">
          <img src="${posterUrl(movie.posterPath)}" alt="${escapeHtml(movie.title)}"
               style="width:100px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.4);" />
          <div style="position:absolute;top:-8px;left:-8px;width:30px;height:30px;background:#e50914;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;color:#fff;">
            ${rank}
          </div>
        </div>
        <div style="flex:1;min-width:0;">
          <h3 style="margin:0 0 6px;font-size:19px;">
            <a href="${tmdbUrl(movie.id)}" style="color:#58a6ff;text-decoration:none;" target="_blank" rel="noopener noreferrer">${escapeHtml(movie.title)}</a>
          </h3>
          <div style="font-size:13px;color:#8b8fa3;margin-bottom:8px;">${escapeHtml(movie.releaseDate)}</div>
          <p style="margin:0;font-size:13px;color:#a0a4b8;line-height:1.5;">${escapeHtml(movie.overview)}</p>
        </div>
      </div>
      <div class="stats-bar" style="display:flex;border-top:1px solid #2a2a3e;font-size:13px;text-align:center;">
        ${movie.dailyGross ? `<div style="flex:1;padding:10px;border-right:1px solid #2a2a3e;">
          <div style="color:#8b8fa3;margin-bottom:2px;">Daily</div>
          <div style="color:#4ade80;font-weight:700;">${formatCurrency(movie.dailyGross)}</div>
        </div>` : ""}
        <div style="flex:1;padding:10px;border-right:1px solid #2a2a3e;">
          <div style="color:#8b8fa3;margin-bottom:2px;">Revenue</div>
          <div style="color:#4ade80;font-weight:600;">${formatCurrency(movie.revenue)}</div>
        </div>
        ${movie.budget > 0 ? `<div style="flex:1;padding:10px;border-right:1px solid #2a2a3e;">
          <div style="color:#8b8fa3;margin-bottom:2px;">Budget</div>
          <div style="color:#c9cdd6;">${formatCurrency(movie.budget)}</div>
        </div>` : ""}
        <div style="flex:1;padding:10px;">
          <div style="color:#8b8fa3;margin-bottom:2px;">Rating</div>
          <div style="color:#facc15;font-weight:600;">${movie.rating.toFixed(1)}</div>
        </div>
      </div>
    </div>`;
}

function renderUpcomingMovie(movie: UpcomingMovie): string {
  return `
    <div class="upcoming-card" style="display:flex;gap:16px;margin-bottom:20px;padding:16px;background:#1e1e2e;border-radius:10px;border:1px solid #2a2a3e;">
      <img src="${posterUrl(movie.posterPath)}" alt="${escapeHtml(movie.title)}"
           style="width:90px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.3);" />
      <div style="flex:1;min-width:0;">
        <h4 style="margin:0 0 6px 0;font-size:16px;">
          <a href="${tmdbUrl(movie.id)}" style="color:#58a6ff;text-decoration:none;" target="_blank" rel="noopener noreferrer">${escapeHtml(movie.title)}</a>
        </h4>
        <div style="font-size:13px;color:#8b8fa3;margin-bottom:8px;">${escapeHtml(movie.releaseDate)}</div>
        <p style="margin:0;font-size:13px;color:#c9cdd6;line-height:1.4;">${escapeHtml(movie.overview)}</p>
      </div>
    </div>`;
}

export function renderDigest(data: DigestData): string {
  const topMoviesHtml = data.topMovies
    .map((movie, i) => renderTopMovie(movie, i + 1))
    .join("\n");

  const upcomingHtml = data.upcomingMovies
    .map((movie) => renderUpcomingMovie(movie))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Box Office Digest — ${escapeHtml(data.generatedDate)}</title>
  <style>
    @media (max-width: 480px) {
      .movie-card > div:first-child { flex-direction: column !important; }
      .movie-card .poster img { width: 100% !important; max-width: 200px !important; }
      .movie-card .poster { flex-shrink: unset !important; }
      .movie-card .stats-bar { flex-wrap: wrap !important; }
      .movie-card .stats-bar > div { flex: 1 1 40% !important; }
      .upcoming-card { flex-direction: column !important; }
      .upcoming-card img { width: 100% !important; max-width: 140px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#121220;color:#e4e4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:720px;margin:0 auto;padding:32px 20px;">

    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="margin:0;font-size:32px;color:#ffffff;letter-spacing:-0.5px;">🎬 Box Office Digest</h1>
      <p style="margin:6px 0 0;font-size:15px;color:#8b8fa3;">${escapeHtml(data.generatedDate)}</p>
    </div>

    <div style="margin-bottom:40px;">
      <h2 style="font-size:22px;color:#ffffff;margin:0 0 20px;padding-bottom:10px;border-bottom:2px solid #2a2a3e;">
        🏆 Top 10 Box Office
      </h2>
      ${topMoviesHtml}
    </div>

    <div style="margin-bottom:32px;">
      <h2 style="font-size:22px;color:#ffffff;margin:0 0 20px;padding-bottom:10px;border-bottom:2px solid #2a2a3e;">
        🎥 Coming Soon
      </h2>
      ${upcomingHtml}
    </div>

    <div style="text-align:center;padding-top:20px;border-top:1px solid #2a2a3e;font-size:12px;color:#555;">
      Powered by TMDb
    </div>

  </div>
</body>
</html>`;
}
