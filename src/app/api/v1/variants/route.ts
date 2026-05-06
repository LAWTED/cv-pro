import { NextRequest, NextResponse } from "next/server";
import { verifyPat } from "@/lib/pat";
import { listVariants } from "@/lib/resume-store";

async function auth(req: NextRequest) {
  const header = req.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return verifyPat(header.slice(7).trim());
}

// GET /api/v1/variants — list all variants for authenticated user
// Returns: [{ audience: string, updatedAt: string }]
export async function GET(req: NextRequest) {
  const user = await auth(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const variants = await listVariants(user.username);
  return NextResponse.json(variants);
}
