import * as cheerio from "cheerio";

export type BoxOfficeMode = "daily" | "weekly";

export interface BoxOfficeEntry {
  rank: number;
  previousRank: number | null;
  title: string;
  gross: number;
  change: number | null;
  theaters: number;
  theaterAverage: number;
  totalGross: number;
  daysInRelease: number;
  mode: BoxOfficeMode;
}

const BASE_URL = "https://www.the-numbers.com";

function parseCurrency(text: string): number {
  const cleaned = text.replace(/[$,]/g, "");
  const value = parseInt(cleaned, 10);
  return isNaN(value) ? 0 : value;
}

function parsePercentage(text: string): number | null {
  const match = text.match(/([+-]?\d+)%/);
  return match ? parseInt(match[1], 10) : null;
}

function parseRank(text: string): number {
  const value = parseInt(text.trim(), 10);
  return isNaN(value) ? 0 : value;
}

function parseBoxOfficeTable(html: string, mode: BoxOfficeMode): BoxOfficeEntry[] {
  const $ = cheerio.load(html);
  const entries: BoxOfficeEntry[] = [];

  const tables = $("table");
  let dataTable: ReturnType<typeof $> | null = null;

  tables.each((_, table) => {
    const headerCells = $(table).find("tr").first().find("td, th");
    if (headerCells.length >= 8 && !dataTable) {
      dataTable = $(table);
    }
  });

  if (!dataTable) return entries;

  const rows = (dataTable as ReturnType<typeof $>).find("tr");

  rows.each((i, row) => {
    if (i === 0) return;

    const cells = $(row).find("td");
    if (cells.length < 8) return;

    const title = $(cells[2]).text().trim();
    if (!title || parseCurrency($(cells[3]).text()) === 0) return;

    const rankText = $(cells[0]).text().trim();
    const rank = parseRank(rankText) || entries.length + 1;

    const prevText = $(cells[1]).text().trim();
    let previousRank: number | null = null;
    if (prevText !== "(new)" && prevText !== "n/a" && prevText !== "-") {
      const parsed = parseInt(prevText.replace(/[()]/g, ""), 10);
      if (!isNaN(parsed)) previousRank = parsed;
    }

    const gross = parseCurrency($(cells[3]).text());
    const change = parsePercentage($(cells[4]).text());

    let theatersIdx: number;
    let avgIdx: number;
    let totalIdx: number;
    let daysIdx: number;

    if (mode === "daily") {
      // Daily has: Rank, Prev, Title, Gross, DailyChange, WeeklyChange, Theaters, Avg, Total, Days
      theatersIdx = 6;
      avgIdx = 7;
      totalIdx = 8;
      daysIdx = 9;
    } else {
      // Weekly has: Rank, Prev, Title, Gross, WeeklyChange, Theaters, Avg, Total, Days
      theatersIdx = 5;
      avgIdx = 6;
      totalIdx = 7;
      daysIdx = 8;
    }

    const theaters = parseInt($(cells[theatersIdx]).text().replace(/,/g, ""), 10) || 0;
    const theaterAverage = parseCurrency($(cells[avgIdx]).text());
    const totalGross = parseCurrency($(cells[totalIdx]).text());
    const daysInRelease = parseInt($(cells[daysIdx]).text().trim(), 10) || 1;

    entries.push({
      rank,
      previousRank,
      title,
      gross,
      change,
      theaters,
      theaterAverage,
      totalGross,
      daysInRelease,
      mode,
    });
  });

  return entries;
}

async function fetchAndParse(url: string, mode: BoxOfficeMode): Promise<BoxOfficeEntry[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "MovieAgent/1.0 (personal project)",
      },
    });

    if (!res.ok) {
      throw new Error(`The Numbers returned ${res.status}`);
    }

    const html = await res.text();
    return parseBoxOfficeTable(html, mode);
  } finally {
    clearTimeout(timeout);
  }
}

export async function getDailyBoxOffice(date?: string): Promise<BoxOfficeEntry[]> {
  const url = date
    ? `${BASE_URL}/box-office-chart/daily/${date.replace(/-/g, "/")}`
    : `${BASE_URL}/daily-box-office-chart`;
  return fetchAndParse(url, "daily");
}

export async function getWeeklyBoxOffice(): Promise<BoxOfficeEntry[]> {
  return fetchAndParse(`${BASE_URL}/weekly-box-office-chart`, "weekly");
}

export async function getBoxOffice(mode: BoxOfficeMode = "daily", date?: string): Promise<BoxOfficeEntry[]> {
  if (mode === "weekly") return getWeeklyBoxOffice();
  return getDailyBoxOffice(date);
}
