import { NextResponse } from "next/server";
import { generateBoxOfficeDigest } from "@/lib/agent/boxoffice-agent";
import { uploadDigest, listDigests } from "@/lib/storage/gcs";
import { renderEmailDigest } from "@/lib/templates/email-template";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") === "daily" ? "daily" : "weekly";
    const { data, html } = await generateBoxOfficeDigest(mode);

    let id: string;
    try {
      id = await uploadDigest(html);
    } catch {
      id = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    }

    const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3001";
    const emailHtml = renderEmailDigest(data, appBaseUrl);

    return NextResponse.json({ id, content: html, emailHtml });
  } catch (error) {
    console.error("Box office digest generation failed:", error);
    return NextResponse.json(
      {
        error: "Failed to generate box office digest",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  try {
    const digests = await listDigests();
    return NextResponse.json(digests);
  } catch {
    return NextResponse.json([]);
  }
}
