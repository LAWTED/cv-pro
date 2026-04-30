import "server-only";
import { supabaseAnon } from "@/lib/supabase/client";
import type { ResumeData } from "@/types/resume";

export async function getResumeByUsername(
  username: string,
): Promise<ResumeData | null> {
  try {
    const { data, error } = await supabaseAnon
      .from("cv_resumes")
      .select("data")
      .eq("username", username)
      .maybeSingle();

    if (error) console.warn("[resume-store] read failed:", error.message);
    if (data?.data) return data.data as ResumeData;
  } catch (err) {
    console.warn("[resume-store] unreachable:", err);
  }
  return null;
}

export async function upsertResume(data: ResumeData): Promise<ResumeData> {
  const next: ResumeData = {
    ...data,
    meta: { updatedAt: new Date().toISOString() },
  };

  const { error } = await supabaseAnon.from("cv_resumes").upsert(
    { username: data.username, data: next, updated_at: next.meta.updatedAt },
    { onConflict: "username" },
  );
  if (error) throw new Error(`upsertResume failed: ${error.message}`);

  return next;
}
