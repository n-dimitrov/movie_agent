import type { Metadata } from "next";
import { randomInt } from "node:crypto";
import { PROJECT21, TMDB_IMG } from "@/lib/data/project21";
import { Project21View } from "@/components/project21/project21-view";

// Pick a fresh spotlight on every visit.
export const dynamic = "force-dynamic";

const finale = PROJECT21[PROJECT21.length - 1];

export const metadata: Metadata = {
  title: "Project21",
  description: "36 sprints, 36 movies. The Project21 wall.",
  openGraph: {
    title: "Project21",
    description: "36 sprints, 36 movies. The Project21 wall.",
    images: finale.backdropPath
      ? [{ url: `${TMDB_IMG}/w1280${finale.backdropPath}`, width: 1280, height: 720 }]
      : [],
  },
};

// Runs on the server per request; a different sprint lands in the spotlight on each visit.
function pickSpotlight(): number {
  return randomInt(PROJECT21.length);
}

export default function Project21Page() {
  return <Project21View movies={PROJECT21} initialIndex={pickSpotlight()} />;
}
