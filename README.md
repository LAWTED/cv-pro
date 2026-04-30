# cv

Turn a PDF resume into a living personal site at `cv.ha7ch.com/{username}`.

This repo contains **both** the website (Next.js) and the Claude Code / Codex plugin (`./plugin`) — they share a single deploy and a single source of truth.

## Repo layout

```
cv/
├── .claude-plugin/
│   └── marketplace.json    # this repo IS a Claude Code marketplace
├── plugin/                 # the cv plugin published to Claude Code users
│   ├── .claude-plugin/plugin.json
│   ├── .mcp.json           # points users to https://cv.ha7ch.com/api/mcp
│   ├── commands/
│   ├── skills/cv/SKILL.md
│   └── README.md
├── src/                    # Next.js 16 + Tailwind 4 app
│   ├── app/
│   │   ├── api/mcp/        # the MCP HTTP server (the production endpoint)
│   │   ├── admin/
│   │   └── [username]/
│   ├── components/resume/  # data-driven resume template
│   └── lib/
│       ├── mcp/
│       ├── supabase/
│       ├── pat.ts
│       └── resume-store.ts
├── supabase/migrations/    # SQL DDL for cv_resumes / cv_pat_tokens / cv_resume_versions
└── .mcp.json               # dev-only: connects local Claude Code to Supabase MCP for schema work
```

## End-user install (no Anthropic marketplace approval needed)

**Plugin route** (recommended — ships skills + slash commands):

```
/plugin marketplace add LAWTED/cv
/plugin install cv@cv
```

**Direct MCP route** (works in Claude Code, Codex, Cursor without the plugin layer):

```
claude mcp add cv --transport http https://cv.ha7ch.com/api/mcp \
  --header "Authorization: Bearer cv_pat_xxxxxxxxxxxxxxxxxxxxxxxx"
```

Generate a token at `cv.ha7ch.com/admin/tokens` (sign in with admin / 123456 in v1).

## Local development

```bash
pnpm install
cp .env.example .env.local      # fill in NEXT_PUBLIC_SUPABASE_URL/_ANON_KEY/SERVICE_ROLE_KEY
pnpm dev
```

The repo's root `.mcp.json` connects Claude Code (running in this directory) to the Supabase official MCP server, so you can ask Claude to run the migration in `supabase/migrations/` directly.

## Deployment

Pushes to `main` auto-deploy via Vercel ([lawteds-projects/cv](https://vercel.com/lawteds-projects/cv)).

The MCP server is a Next.js route handler at `src/app/api/mcp/route.ts`, deployed alongside the website. No separate process.

## Architecture in one paragraph

User signs in at `/admin`, generates a PAT (HMAC-SHA256 hashed in `cv_pat_tokens`). Claude Code calls our MCP endpoint over HTTP with `Authorization: Bearer cv_pat_…`. We auth, dispatch to one of 5 tools (`get_resume` / `update_resume` / `update_section` / `list_versions` / `rollback`), version the diff into `cv_resume_versions`, and upsert `cv_resumes`. The public route `cv.ha7ch.com/{username}` reads via the anon key (RLS public-read policy).

## Out of scope for v1

- Real user accounts (v1 hardcodes admin / 123456 via env)
- OAuth 2.1 (PAT only — v2 will add OAuth Authorization Server)
- Multiple templates (single template ported from [`portfolio/app/resume`](https://github.com/LAWTED/portfolio))
- Server-side PDF parsing (Claude reads PDFs natively)
