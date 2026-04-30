# cv plugin

Turn your PDF resume into a living personal site at `cv.ha7ch.com/{username}`.

## Install

```
/plugin install ha7ch/cv
```

## Configure your token

1. Sign in at <https://cv.ha7ch.com/admin/login>
2. Visit **Tokens** → **Generate token** and copy the `cv_pat_...` value
3. Export it where Claude Code can read it:

```bash
export CV_TOKEN=cv_pat_xxxxxxxxxxxxxxxxxx
```

(or set it in your shell profile / direnv).

## Use

In any Claude Code session, drop your resume PDF into the chat and say:

> Update my resume with this PDF.

Claude will read the PDF, extract the structured shape, and push it via the `cv` MCP server. Within a second, your live page at `cv.ha7ch.com/{your-handle}` reflects the change.

You can also conversationally edit:

> Rewrite the Alibaba bullet to emphasise the AI work.

The plugin will fetch the current resume, change just that section, and publish a new version.

## Slash commands

- `/cv:preview` — open your live page in the browser
- `/cv:publish` — force a publish from the current conversation context

## Roll back

If something goes sideways:

> Show me the last few versions of my CV.

Then:

> Roll back to v3.

## Auth model

v0.1 uses Personal Access Tokens (`cv_pat_...`) sent via `Authorization: Bearer`. v1.0 will move to OAuth 2.1.

## Repo

<https://github.com/ha7ch/cv-plugin>
