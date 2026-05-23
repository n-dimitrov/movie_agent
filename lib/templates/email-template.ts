import { DigestData, TopMovie } from "./digest-types";

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function posterUrl(posterPath: string): string {
  return `https://image.tmdb.org/t/p/w154${posterPath}`;
}

function tmdbUrl(id: number): string {
  return `https://www.themoviedb.org/movie/${id}`;
}

function renderMovieCard(movie: TopMovie, rank: number): string {
  return `<table border="0" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:12px;border:1px solid #e5e5e5;border-radius:8px;">
  <tr>
    <td style="width:70px;vertical-align:top;padding:12px;">
      <a href="${tmdbUrl(movie.id)}">
        <img src="${posterUrl(movie.posterPath)}" alt="${escapeHtml(movie.title)}" style="width:60px;border-radius:6px;" />
      </a>
    </td>
    <td style="vertical-align:top;padding:12px 12px 12px 0;">
      <div style="font-size:11px;font-weight:bold;color:#e50914;margin-bottom:2px;">#${rank}</div>
      <a href="${tmdbUrl(movie.id)}" style="font-size:16px;font-weight:700;color:#333;text-decoration:none;">${escapeHtml(movie.title)}</a>
      <div style="margin-top:6px;font-size:13px;color:#666;">
        <span style="color:#16a34a;font-weight:700;">${formatCurrency(movie.revenue)}</span>
        &nbsp;&middot;&nbsp; ⭐ ${movie.rating.toFixed(1)}
      </div>
    </td>
  </tr>
</table>`;
}

export function renderEmailDigest(data: DigestData, appBaseUrl: string): string {
  const moviesHtml = data.topMovies
    .map((movie, i) => renderMovieCard(movie, i + 1))
    .join("\n");

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="margin:0 0 4px;font-size:22px;color:#333;">🎬 Box Office Digest</h2>
  <p style="margin:0 0 20px;font-size:14px;color:#888;">${escapeHtml(data.generatedDate)}</p>
  ${moviesHtml}
  <p style="margin:24px 0 0;text-align:center;">
    <a href="${appBaseUrl}" style="display:inline-block;background:#0066cc;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600;">View Full Digest</a>
  </p>
</div>`;
}
