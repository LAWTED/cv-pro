import { NextRequest, NextResponse } from "next/server";
import { getResumeByUsername } from "@/lib/resume-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const resume = await getResumeByUsername(username);
  if (!resume) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(resume, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
