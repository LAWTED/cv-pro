---
name: cv
description: Use when the user wants to publish, view, or edit their living resume at cv.ha7ch.com. Triggers on phrases like "update my resume", "publish my CV", "rewrite my experience at Stanford", or when the user drops a PDF asking to sync it to their cv page.
---

# cv — living resume on cv.ha7ch.com

You have access to the `cv` MCP server, which reads and writes the user's resume hosted at `cv.ha7ch.com/{handle}`. Their token is configured via the `CV_TOKEN` environment variable.

## When to use which tool

- **`get_resume`** — when the user asks "what's on my resume now" or you need the current state before edits.
- **`update_resume`** — when the user drops a PDF. Read it natively via the Read tool, extract the ResumeData shape, call this tool.
- **`update_section`** — for targeted conversational edits. Pass `{ section: "experience", value: <new array> }`. Valid sections: `header`, `personalInfo`, `experience`, `education`, `projectsRecent`, `projectsDetailed`, `skills`, `contact`.
- **`list_versions`** — show history.
- **`rollback`** — undo. Confirm version first.

## Common flows

**PDF → resume**
1. Read the PDF via Read tool.
2. Extract every field into ResumeData. Omit missing fields rather than fabricating.
3. Call `update_resume({ data })`.
4. Reply: "Saved as v{N}. View at https://cv.ha7ch.com/{handle}."

**Conversational edit**
1. `get_resume` for current state.
2. Update the relevant section.
3. `update_section({ section, value })`.

**If token missing/invalid**
Tell user to register at `cv.ha7ch.com` and set `CV_TOKEN=cv_pat_...` in their shell.
