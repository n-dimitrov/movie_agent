"use client";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function Header({
  year,
  month,
  minYear,
  maxYear,
  onYearChange,
  onMonthChange,
  onMinYearChange,
  onMaxYearChange,
  onSearch,
  onRandom,
  loading,
}: {
  year: number;
  month: number;
  minYear: number;
  maxYear: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onMinYearChange: (y: number) => void;
  onMaxYearChange: (y: number) => void;
  onSearch: () => void;
  onRandom: () => void;
  loading: boolean;
}) {
  return (
    <header className="bg-surface px-6 py-5 border-b border-border">
      <h1 className="text-2xl font-bold mb-4">
        <span className="mr-2">🎬</span>Movie Discovery
      </h1>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="bg-surface-hover text-foreground border border-border rounded-lg px-3 py-2 text-sm"
        >
          {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map(
            (y) => (
              <option key={y} value={y}>
                {y}
              </option>
            )
          )}
        </select>

        <select
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="bg-surface-hover text-foreground border border-border rounded-lg px-3 py-2 text-sm"
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={i + 1} value={i + 1}>
              {name}
            </option>
          ))}
        </select>

        <button
          onClick={onSearch}
          disabled={loading}
          className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-lg text-sm font-semibold transition-transform hover:scale-[1.03] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Get Movies"}
        </button>

        <button
          onClick={onRandom}
          disabled={loading}
          className="bg-surface-hover text-foreground border border-border px-5 py-2 rounded-lg text-sm font-semibold transition-transform hover:scale-[1.03] disabled:opacity-50"
        >
          🎲 Random
        </button>

        <span className="text-xs text-muted ml-2">
          Range:
          <input
            type="number"
            value={minYear}
            onChange={(e) => onMinYearChange(Number(e.target.value))}
            className="w-16 bg-surface-hover text-foreground border border-border rounded px-2 py-1 text-xs mx-1"
          />
          –
          <input
            type="number"
            value={maxYear}
            onChange={(e) => onMaxYearChange(Number(e.target.value))}
            className="w-16 bg-surface-hover text-foreground border border-border rounded px-2 py-1 text-xs mx-1"
          />
        </span>
      </div>
    </header>
  );
}
