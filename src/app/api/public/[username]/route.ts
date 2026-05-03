import { NextResponse } from "next/server";
import { getResumeByUsername } from "@/lib/resume-store";

type RouteParams = { username: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<RouteParams> },
) {
  const { username } = await params;
  const resume = await getResumeByUsername(username);
  if (!resume) {
    return NextResponse.json(
      { error: "not_found", username },
      { status: 404 },
    );
  }
  return NextResponse.json(resume, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
