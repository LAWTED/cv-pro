---
name: cv
description: Update, view, or edit the user's living resume at cv.ha7ch.com. Triggers on any resume-related request — attaching a PDF, pasting resume text, asking to edit an experience or section, or asking to view the current resume.
allowed-tools: Bash(npx @lawtedwu/aicv@latest:*)
argument-hint: "[section to update, or attach a PDF / paste resume text]"
---

You are helping the user keep their living resume at cv.ha7ch.com up to date using the `aicv` CLI.

## Preflight

Check that the CLI is available and the token is set:

```bash
CV_TOKEN=$CV_TOKEN npx @lawtedwu/aicv@latest --help
```

If `CV_TOKEN` is not set, ask the user for their token (they can get one at cv.ha7ch.com) and prepend it to subsequent CLI calls.

Fetch the current resume so you have context:

```bash
CV_TOKEN=$CV_TOKEN npx @lawtedwu/aicv@latest get
```

## Update

Determine what the user wants to change based on `$ARGUMENTS` and any attached files or pasted content:

- **PDF attached** — read the file, extract all resume fields that are present, call `npx aicv update` with the full extracted JSON.
- **Text / paste** — parse the content, identify which sections it covers, call `npx aicv update-section` for each changed section.
- **Conversational edit** ("rewrite my Alibaba bullet", "add a new project") — apply the edit to the relevant section from the fetched resume, then call `npx aicv update-section`.
- **Unclear** — ask one brief clarifying question before proceeding.

Sections: `header`, `personalInfo`, `experience`, `education`, `projectsRecent`, `projectsDetailed`, `skills`, `contact`.

## Verify

After updating, confirm success and show the live URL:

```bash
CV_TOKEN=$CV_TOKEN npx @lawtedwu/aicv@latest whoami
```

Tell the user their page URL: `https://cv.ha7ch.com/{handle}`

## Notes

- The CLI reads `CV_TOKEN` from the environment. Always prepend it: `CV_TOKEN=... npx @lawtedwu/aicv@latest <command>`
- Do not fabricate resume content — only use what the user explicitly provides.
- `meta.updatedAt` is server-managed; do not set it manually.
