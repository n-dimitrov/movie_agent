import * as cheerio from "cheerio";

export interface BoxOfficeEntry {
  rank: number;
  previousRank: number | null;
  title: string;
  dailyGross: number;
  dailyChange: number | null;
  weeklyChange: number | null;
  theaters: number;
  theaterAverage: number;
  totalGross: number;
  daysInRelease: number;
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

function parseBoxOfficeTable(html: string): BoxOfficeEntry[] {
  const $ = cheerio.load(html);
  const entries: BoxOfficeEntry[] = [];

  // Target the first table that has 10+ columns (the full desktop table)
  const tables = $("table");
  let dataTable: ReturnType<typeof $> | null = null;

  tables.each((_, table) => {
    const headerCells = $(table).find("tr").first().find("td, th");
    if (headerCells.length >= 9 && !dataTable) {
      dataTable = $(table);
    }
  });

  if (!dataTable) return entries;

  const rows = (dataTable as ReturnType<typeof $>).find("tr");

  rows.each((i, row) => {
    if (i === 0) return; // skip header

    const cells = $(row).find("td");
    if (cells.length < 9) return; // skip summary/malformed rows

    const title = $(cells[2]).text().trim();
    if (!title || parseCurrency($(cells[3]).text()) === 0) return; // skip summary rows

    const rankText = $(cells[0]).text().trim();
    const rank = parseRank(rankText) || entries.length + 1;

    const prevText = $(cells[1]).text().trim();
    let previousRank: number | null = null;
    if (prevText !== "(new)" && prevText !== "n/a" && prevText !== "-") {
      const parsed = parseInt(prevText.replace(/[()]/g, ""), 10);
      if (!isNaN(parsed)) previousRank = parsed;
    }

    const dailyGross = parseCurrency($(cells[3]).text());
    const dailyChange = parsePercentage($(cells[4]).text());
    const weeklyChange = parsePercentage($(cells[5]).text());
    const theaters = parseInt($(cells[6]).text().replace(/,/g, ""), 10) || 0;
    const theaterAverage = parseCurrency($(cells[7]).text());
    const totalGross = parseCurrency($(cells[8]).text());
    const daysInRelease = parseInt($(cells[9]).text().trim(), 10) || 1;

    entries.push({
      rank,
      previousRank,
      title,
      dailyGross,
      dailyChange,
      weeklyChange,
      theaters,
      theaterAverage,
      totalGross,
      daysInRelease,
    });
  });

  return entries;
}

export async function getDailyBoxOffice(date?: string): Promise<BoxOfficeEntry[]> {
  let url: string;
  if (date) {
    const [year, month, day] = date.split("-");
    url = `${BASE_URL}/box-office-chart/daily/${year}/${month}/${day}`;
  } else {
    url = `${BASE_URL}/daily-box-office-chart`;
  }

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
    return parseBoxOfficeTable(html);
  } finally {
    clearTimeout(timeout);
  }
}
