"use client";

import { useState, useCallback } from "react";
import type { Movie } from "@/lib/tmdb";
import { Header } from "@/components/header";
import { MovieGrid } from "@/components/movie-grid";

const CURRENT_YEAR = new Date().getFullYear();

export default function Home() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [minYear, setMinYear] = useState(1978);
  const [maxYear, setMaxYear] = useState(CURRENT_YEAR);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchMovies = useCallback(async (y: number, m: number) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/movies?year=${y}&month=${m}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Movie[] = await res.json();
      setMovies(data);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => fetchMovies(year, month);

  const handleRandom = () => {
    const ry = minYear + Math.floor(Math.random() * (maxYear - minYear + 1));
    const rm = 1 + Math.floor(Math.random() * 12);
    setYear(ry);
    setMonth(rm);
    fetchMovies(ry, rm);
  };

  return (
    <>
      <Header
        year={year}
        month={month}
        minYear={minYear}
        maxYear={maxYear}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onMinYearChange={setMinYear}
        onMaxYearChange={setMaxYear}
        onSearch={handleSearch}
        onRandom={handleRandom}
        loading={loading}
      />
      <main className="flex-1 px-6 py-8 md:px-10">
        {hasSearched && !loading && movies.length > 0 && (
          <p className="text-sm text-muted mb-6">
            Popular movies from{" "}
            {new Date(year, month - 1).toLocaleString("en", { month: "long" })}{" "}
            {year}
          </p>
        )}
        <MovieGrid movies={movies} loading={loading} hasSearched={hasSearched} />
      </main>
    </>
  );
}
