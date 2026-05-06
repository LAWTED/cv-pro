import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPat } from "@/lib/pat";
import { getVariantByAudience, upsertVariant, deleteVariant } from "@/lib/resume-store";
import { resumeSchema } from "@/types/resume";

async function auth(req: NextRequest) {
  const header = req.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return verifyPat(header.slice(7).trim());
}

function issuesPayload(err: z.ZodError) {
  return err.issues.map((i) => ({
    path: i.path.map((p) => String(p)).join("."),
    message: i.message,
    code: i.code,
  }));
}

// GET /api/v1/variants/[audience] — get specific variant (full ResumeData JSON)
export async function GET(req: NextRequest, { params }: { params: Promise<{ audience: string }> }) {
  const user = await auth(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { audience } = await params;
  const variant = await getVariantByAudience(user.username, audience);
  if (!variant) return NextResponse.json({ error: "variant not found" }, { status: 404 });

  return NextResponse.json(variant);
}

// PUT /api/v1/variants/[audience] — create/update variant
export async function PUT(req: NextRequest, { params }: { params: Promise<{ audience: string }> }) {
  const user = await auth(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { audience } = await params;

  const merged = {
    ...(body && typeof body === "object" ? (body as Record<string, unknown>) : {}),
    username: user.username,
    meta: { updatedAt: new Date().toISOString() },
  };

  const result = resumeSchema.safeParse(merged);
  if (!result.success) {
    return NextResponse.json(
      { error: "invalid resume", issues: issuesPayload(result.error) },
      { status: 422 },
    );
  }

  const saved = await upsertVariant(user.username, audience, result.data);
  return NextResponse.json(saved);
}

// DELETE /api/v1/variants/[audience] — delete variant
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ audience: string }> }) {
  const user = await auth(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { audience } = await params;
  await deleteVariant(user.username, audience);
  return NextResponse.json({ ok: true });
}
