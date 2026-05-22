import { NextRequest, NextResponse } from "next/server";
import { generateBoxOfficeDigest } from "@/lib/agent/boxoffice-agent";
import { uploadDigest, listDigests, generateShareableUrl } from "@/lib/storage/gcs";

export async function POST(request: NextRequest) {
  try {
    const content = await generateBoxOfficeDigest();

    let id: string;
    let url: string;

    try {
      id = await uploadDigest(content);
      try {
        url = await generateShareableUrl(id);
      } catch {
        const host = request.headers.get("host") || "localhost:3001";
        const protocol = host.startsWith("localhost") ? "http" : "https";
        url = `${protocol}://${host}/api/boxoffice/${id}`;
      }
    } catch {
      id = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const host = request.headers.get("host") || "localhost:3001";
      const protocol = host.startsWith("localhost") ? "http" : "https";
      url = `${protocol}://${host}/api/boxoffice/${id}`;
    }

    return NextResponse.json({ id, url, content });
  } catch (error) {
    console.error("Box office digest generation failed:", error);
    return NextResponse.json(
      {
        error: "Failed to generate box office digest",
        details: error instanceof Error ? error.message : String(error)
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
