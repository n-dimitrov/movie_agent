import { NextRequest, NextResponse } from "next/server";
import { getDigest } from "@/lib/storage/gcs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^\d{8}$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid digest ID (expected YYYYMMDD format)" },
      { status: 400 }
    );
  }

  try {
    const content = await getDigest(id);
    return new NextResponse(content, {
      headers: {
        "content-type": "text/html",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Digest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch digest" },
      { status: 502 }
    );
  }
}
