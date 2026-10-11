"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { TMDB_IMG, type SprintMovie } from "@/lib/data/project21";

type View = "wall" | "list";
const VIEW_KEY = "project21-view";

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="M4 4l5 5" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" /></svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  );
}

function Poster({ movie, size, className = "", priority = false }: { movie: SprintMovie; size: "w342" | "w500"; className?: string; priority?: boolean }) {
  if (!movie.posterPath) {
    return <div className={`aspect-[2/3] bg-surface-hover flex items-center justify-center text-3xl ${className}`}>🎬</div>;
  }
  return (
    <Image
      src={`${TMDB_IMG}/${size}${movie.posterPath}`}
      alt={movie.title}
      width={size === "w500" ? 500 : 342}
      height={size === "w500" ? 750 : 513}
      priority={priority}
      className={`aspect-[2/3] object-cover ${className}`}
    />
  );
}

const WALL_COLS = 9;
const WALL_INTERVAL_MS = 4000;

// Kiosk-style wall: every poster fills the screen, the current sprint is enlarged in the
// center and the highlight walks to the next sprint on a timer.
function FullscreenWall({ movies, start, onExit }: { movies: SprintMovie[]; start: number; onExit: (index: number) => void }) {
  const [idx, setIdx] = useState(start);
  const [paused, setPaused] = useState(false);
  const rows = Math.ceil(movies.length / WALL_COLS);

  const next = useCallback(() => setIdx((i) => (i + 1) % movies.length), [movies.length]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + movies.length) % movies.length), [movies.length]);

  // Auto-advance. Depending on `idx` restarts the timer whenever the user picks a movie manually.
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(next, WALL_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [idx, paused, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") { e.preventDefault(); setPaused((p) => !p); }
      else if (e.key === "Escape") onExit(idx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onExit, idx]);

  const m = movies[idx];

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] select-none overflow-hidden">
      <div
        className="grid h-full w-full gap-1.5 p-1.5"
        style={{
          gridTemplateColumns: `repeat(${WALL_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {movies.map((mv, i) => (
          <button
            key={mv.sprint}
            type="button"
            onClick={() => setIdx(i)}
            title={`Sprint ${mv.sprint}: ${mv.title}`}
            className={`relative overflow-hidden rounded-md transition-all duration-500 ${
              i === idx ? "opacity-100 ring-2 ring-gold" : "opacity-30 hover:opacity-70"
            }`}
          >
            {mv.posterPath ? (
              <Image src={`${TMDB_IMG}/w342${mv.posterPath}`} alt={mv.title} fill sizes="12vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-surface-hover flex items-center justify-center text-2xl">🎬</div>
            )}
            <span className={`absolute top-1 left-1 font-mono text-[10px] px-1.5 py-0.5 rounded ${
              i === idx ? "bg-gold text-black" : "bg-[#0f0f0f]/85 text-white"
            }`}>{mv.sprint}</span>
          </button>
        ))}
      </div>

      {/* Center card: keyed on sprint so it re-animates on every change */}
      <div key={m.sprint} className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ animation: "p21-fade 600ms ease-out both" }}>
        <div className="flex flex-col items-center gap-5">
          <Poster movie={m} size="w500" priority className="h-[60vh] w-auto rounded-xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] ring-1 ring-white/20" />
          <div className="text-center px-6 py-3 rounded-xl bg-[#0f0f0f]/75 backdrop-blur">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Sprint {m.sprint} of {movies.length}</div>
            <div className="mt-1 text-3xl md:text-5xl font-bold tracking-tight text-white text-balance">{m.title}</div>
            <div className="mt-1 text-sm text-[#cfcfdc]">
              {[m.year, m.directors.join(", "), m.genres.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex gap-2">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f0f0f]/70 border border-white/15 text-white backdrop-blur hover:bg-accent hover:border-accent transition-colors"
          title={paused ? "Resume (space)" : "Pause (space)"}
          aria-label={paused ? "Resume" : "Pause"}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
        <button
          type="button"
          onClick={() => onExit(idx)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f0f0f]/70 border border-white/15 text-white backdrop-blur hover:bg-accent hover:border-accent transition-colors"
          title="Exit fullscreen (Esc)"
          aria-label="Exit fullscreen"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

export function Project21View({ movies, initialIndex }: { movies: SprintMovie[]; initialIndex: number }) {
  const [spot, setSpot] = useState(initialIndex);
  const [view, setView] = useState<View>("wall");
  const [fullscreen, setFullscreen] = useState(false);

  // Browser-only state (saved view, #sprint deep link) is applied after hydration
  // in a frame callback so the server-rendered markup matches on first paint.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(VIEW_KEY);
        if (saved === "wall" || saved === "list") setView(saved);
      } catch {}
      const n = Number(window.location.hash.replace("#", ""));
      if (Number.isInteger(n) && n >= 1 && n <= movies.length) setSpot(n - 1);
    });
    return () => cancelAnimationFrame(id);
  }, [movies.length]);

  const openFullscreen = () => {
    setFullscreen(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const closeFullscreen = useCallback((index: number) => {
    setFullscreen(false);
    setSpot(index);
    history.replaceState(null, "", `#${index + 1}`);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, []);

  // Leaving browser fullscreen (Esc handled by the browser) also leaves wall mode.
  useEffect(() => {
    if (!fullscreen) return;
    const onChange = () => { if (!document.fullscreenElement) setFullscreen(false); };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [fullscreen]);

  const changeView = (v: View) => {
    setView(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch {}
  };

  const spotlight = (i: number) => {
    setSpot(i);
    history.replaceState(null, "", `#${i + 1}`);
    document.getElementById("spotlight")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const shuffle = () => {
    let n = spot;
    while (n === spot) n = Math.floor(Math.random() * movies.length);
    setSpot(n);
    history.replaceState(null, "", `#${n + 1}`);
  };

  const m = movies[spot];

  return (
    <main className="flex-1 px-4 py-6 md:px-10 md:py-10 max-w-7xl mx-auto w-full">
      {fullscreen && <FullscreenWall movies={movies} start={spot} onExit={closeFullscreen} />}
      {/* Spotlight */}
      <section id="spotlight" className="relative rounded-2xl overflow-hidden bg-surface scroll-mt-4">
        {m.backdropPath && (
          <Image
            src={`${TMDB_IMG}/w1280${m.backdropPath}`}
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-top opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/80 to-[#0f0f0f]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />

        <div className="relative grid grid-cols-1 sm:grid-cols-[180px_1fr] md:grid-cols-[220px_1fr] gap-6 md:gap-8 p-6 md:p-10">
          <Poster movie={m} size="w500" priority className="w-36 sm:w-full rounded-lg shadow-[0_16px_40px_rgba(0,0,0,0.6)]" />

          <div className="min-w-0 flex flex-col justify-end">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] font-mono">
              <span className="text-gold">Now showing</span>
              <span className="text-muted">Sprint {m.sprint} of {movies.length}</span>
            </div>
            <h1 className="mt-2 text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight text-balance">{m.title}</h1>
            {m.sprintTitle.toLowerCase() !== m.title.toLowerCase() && (
              <div className="mt-1 text-sm text-muted">Sprint name: {m.sprintTitle}</div>
            )}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#cfcfdc]">
              {m.rating !== null && <span className="text-gold">★ {m.rating.toFixed(1)}</span>}
              {m.year && <span>{m.year}</span>}
              {m.runtime && <span>{m.runtime} min</span>}
              {m.directors.length > 0 && <span>Dir. {m.directors.join(", ")}</span>}
              {m.genres.length > 0 && <span>{m.genres.join(", ")}</span>}
            </div>
            {m.tagline && <p className="mt-4 italic text-base md:text-lg text-[#eceaf5] max-w-[54ch]">“{m.tagline}”</p>}
            <p className="mt-3 text-sm text-[#bbb] leading-relaxed max-w-[62ch] line-clamp-4">{m.overview}</p>
            {m.cast.length > 0 && (
              <p className="mt-3 text-sm text-[#bbb]"><span className="text-muted">Cast</span> {m.cast.join(", ")}</p>
            )}
          </div>
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={shuffle}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-[#0f0f0f]/60 border border-white/15 text-sm text-white backdrop-blur hover:bg-accent hover:border-accent transition-colors"
            title="Show another sprint"
          >
            <ShuffleIcon /> Shuffle
          </button>
          <button
            type="button"
            onClick={openFullscreen}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f0f0f]/60 border border-white/15 text-white backdrop-blur hover:bg-accent hover:border-accent transition-colors"
            title="Fullscreen wall with auto-play"
            aria-label="Fullscreen wall with auto-play"
          >
            <ExpandIcon />
          </button>
        </div>
      </section>

      {/* Wall / List */}
      <section id="wall" className="mt-10 scroll-mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-bold">All {movies.length} sprints</h2>
            <p className="text-xs text-muted mt-0.5">Click a movie to put it in the spotlight</p>
          </div>
          <div role="tablist" aria-label="View" className="inline-flex p-1 gap-0.5 rounded-lg bg-surface border border-border">
            {(["wall", "list"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => changeView(v)}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm transition-colors ${
                  view === v ? "bg-accent text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {v === "wall" ? <GridIcon /> : <ListIcon />}
                {v === "wall" ? "Wall" : "List"}
              </button>
            ))}
          </div>
        </div>

        {view === "wall" ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {movies.map((mv, i) => (
              <button
                key={mv.sprint}
                type="button"
                onClick={() => spotlight(i)}
                className={`group relative rounded-lg overflow-hidden text-left transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(99,102,241,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  i === spot ? "ring-2 ring-gold ring-offset-2 ring-offset-background" : ""
                }`}
                title={`Sprint ${mv.sprint}: ${mv.title}`}
              >
                <span className={`absolute top-1.5 left-1.5 z-10 font-mono text-[10px] px-1.5 py-0.5 rounded ${
                  i === spot ? "bg-gold text-black" : "bg-[#0f0f0f]/85 text-white"
                }`}>{mv.sprint}</span>
                <Poster movie={mv} size="w342" className="w-full" />
              </button>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {movies.map((mv, i) => (
              <button
                key={mv.sprint}
                type="button"
                onClick={() => spotlight(i)}
                className={`w-full grid grid-cols-[40px_40px_1fr] sm:grid-cols-[48px_44px_1fr_auto] gap-3 sm:gap-4 items-center py-2.5 text-left hover:bg-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  i === spot ? "bg-surface" : ""
                }`}
              >
                <span className={`font-mono text-lg tabular-nums ${i === spot ? "text-gold" : "text-muted"}`}>
                  {String(mv.sprint).padStart(2, "0")}
                </span>
                <Poster movie={mv} size="w342" className="w-full rounded" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold truncate">{mv.title}</span>
                  <span className="block text-xs text-muted truncate">
                    {[mv.year, mv.directors.join(", "), mv.genres.join(", ")].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="hidden sm:grid justify-items-end gap-0.5 font-mono text-xs text-muted tabular-nums">
                  {mv.rating !== null && <span className="text-gold">★ {mv.rating.toFixed(1)}</span>}
                  {mv.runtime && <span>{mv.runtime} min</span>}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
