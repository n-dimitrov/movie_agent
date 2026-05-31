#!/bin/bash
set -e

MODE="${1:-daily}"
DATE="${2:-}"

if [ "$MODE" != "daily" ] && [ "$MODE" != "weekly" ]; then
  echo "Usage: ./scripts/fetch-boxoffice.sh [daily|weekly] [YYYY-MM-DD]"
  echo "  daily  - Daily box office chart (default)"
  echo "  weekly - Weekly box office chart"
  echo "  Date only applies to daily mode"
  exit 1
fi

echo "Fetching ${MODE} box office from The Numbers..."
if [ -n "$DATE" ]; then
  echo "Date: $DATE"
fi
echo ""

npx tsx -e "
import { getBoxOffice } from './lib/tools/boxoffice-scraper';

async function main() {
  const mode = '${MODE}' as 'daily' | 'weekly';
  const date = '${DATE}' || undefined;
  const entries = await getBoxOffice(mode, date);

  if (entries.length === 0) {
    console.error('No entries found');
    process.exit(1);
  }

  const label = mode === 'weekly' ? 'Weekly Gross' : 'Daily Gross';
  console.log('Rank  Title                                    ' + label.padStart(15) + '      Total Gross      Theaters  Avg       Day');
  console.log('----  ---------------------------------------- --------------- --------------- --------- --------- ---');

  for (const e of entries) {
    const rank = String(e.rank).padStart(4);
    const title = e.title.padEnd(40).slice(0, 40);
    const gross = ('\$' + e.gross.toLocaleString()).padStart(15);
    const total = ('\$' + e.totalGross.toLocaleString()).padStart(15);
    const theaters = String(e.theaters).padStart(9);
    const avg = ('\$' + e.theaterAverage.toLocaleString()).padStart(9);
    const days = String(e.daysInRelease).padStart(3);
    console.log(rank + '  ' + title + ' ' + gross + ' ' + total + ' ' + theaters + ' ' + avg + ' ' + days);
  }

  console.log('');
  const totalBox = entries.reduce((s, e) => s + e.gross, 0);
  console.log('Total box office: \$' + totalBox.toLocaleString());
  console.log('Reporting movies: ' + entries.length);
}

main();
"
