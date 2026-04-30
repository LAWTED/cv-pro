---
name: cv
description: Use when the user wants to publish, view, or edit their living resume at cv.ha7ch.com. Triggers on phrases like "update my resume", "publish my CV", "rewrite my Stanford bullet", or when the user drops a PDF asking to sync it to their cv page.
---

# cv — living resume on cv.ha7ch.com

You have access to the `cv` MCP server, which reads and writes the user's resume hosted at `cv.ha7ch.com/{username}`. Their token is configured via the `CV_TOKEN` environment variable.

## When to use which tool

- **`get_resume`** — when the user asks "what's on my resume now", "show me my CV", or you need the current state before edits.
- **`update_resume`** — when the user drops a PDF asking to **replace** the resume. You read the PDF (you have native PDF multimodal support — just open the file via the Read tool), extract the structured `ResumeData` shape, then call this tool with `{ data: <full ResumeData> }`. The server stamps `meta.updatedAt` and `meta.version` automatically; do not set them yourself. The `username` field is overridden by the authenticated user's handle.
- **`update_section`** — when the user asks to change one section in conversation ("rewrite the experience bullet for Alibaba", "add a new project"). Pass `{ section: "experience", value: <new array> }`. Sections accepted: `header`, `personalInfo`, `experience`, `education`, `projectsRecent`, `projectsDetailed`, `skills`, `contact`.
- **`list_versions`** — when the user wants to see history.
- **`rollback`** — when the user wants to undo a recent change. Confirm the version number with them first.

## ResumeData shape

```ts
interface ResumeData {
  username: string;       // ignored, server uses your authenticated handle
  header: { name: string };
  personalInfo: {
    pronouns?: string;
    pronounsVoice?: string;
    mbti?: string;
    mbtiVoice?: string;
    birthday?: string;
    email: string;
    emailVoice?: string;
  };
  experience: Array<{
    company: string;
    role: string;
    startDate: string;     // "Apr 2025"
    endDate: string;       // "Present" or "Jul 2023"
    companyVoice?: string;
    roleVoice?: string;
    dateVoice?: string;
    stockSymbol?: string;
    stockCurrency?: string;
    stockVoice?: string;
  }>;
  education: Array<{
    school: string;
    major: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  projectsRecent: Array<{
    title: string;
    description: string;
    url: string;
  }>;
  projectsDetailed: Array<{
    title: string;
    type: string;
    startDate: string;
    endDate?: string;
    url?: string;
    award?: string;
    bullets: string[];
    externalLink?: { label: string; url: string };
  }>;
  skills: Array<{ name: string; items: string[] }>;
  contact: Array<{ label: string; url: string }>;
}
```

The `*Voice` fields are short hover-text quips that surface on the live page. Leave them empty or omit them when extracting from a PDF — the user can add them later.

## Common flows

**"Update my resume from this PDF"**
1. Read the attached PDF.
2. Extract every section into the `ResumeData` shape. Be conservative — if a field isn't in the PDF, omit it rather than fabricate.
3. Call `update_resume({ data: <extracted> })`.
4. Reply with: "Saved as v{N}. Open https://cv.ha7ch.com/{username} to see it."

**"Add Stanford to my experience"**
1. Call `get_resume` to see current state.
2. Construct the new experience array with the addition.
3. Call `update_section({ section: "experience", value: <new array> })`.

**"Undo the last change"**
1. Call `list_versions`.
2. Pick the second-most-recent version (the one before the latest).
3. Confirm with the user, then call `rollback({ version: N })`.

## What not to do

- Don't fabricate `ResumeData` fields not in the source. Empty arrays and omitted optional fields are fine.
- Don't set `meta.version` or `meta.updatedAt` — server-managed.
- Don't attempt OCR or PDF parsing tools; you read PDFs natively via the Read tool.
- If `update_resume` returns an error mentioning a missing token, tell the user to generate a PAT at `cv.ha7ch.com/admin/tokens` and set `CV_TOKEN`.
