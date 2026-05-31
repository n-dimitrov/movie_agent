#!/bin/bash
set -e

DATE="${1:-}"

echo "🎬 Fetching Daily Box Office from The Numbers..."
if [ -n "$DATE" ]; then
  echo "Date: $DATE"
fi
echo ""

npx tsx -e "
import { getDailyBoxOffice } from './lib/tools/boxoffice-scraper';

async function main() {
  const date = '${DATE}' || undefined;
  const entries = await getDailyBoxOffice(date);

  if (entries.length === 0) {
    console.error('No entries found');
    process.exit(1);
  }

  console.log('Rank  Title                                    Daily Gross      Total Gross      Theaters  Avg       Day');
  console.log('----  ---------------------------------------- --------------- --------------- --------- --------- ---');

  for (const e of entries) {
    const rank = String(e.rank).padStart(4);
    const title = e.title.padEnd(40).slice(0, 40);
    const daily = ('$' + e.dailyGross.toLocaleString()).padStart(15);
    const total = ('$' + e.totalGross.toLocaleString()).padStart(15);
    const theaters = String(e.theaters).padStart(9);
    const avg = ('$' + e.theaterAverage.toLocaleString()).padStart(9);
    const days = String(e.daysInRelease).padStart(3);
    console.log(rank + '  ' + title + ' ' + daily + ' ' + total + ' ' + theaters + ' ' + avg + ' ' + days);
  }

  console.log('');
  const totalBox = entries.reduce((s, e) => s + e.dailyGross, 0);
  console.log('Total box office: $' + totalBox.toLocaleString());
  console.log('Reporting movies: ' + entries.length);
}

main();
"
