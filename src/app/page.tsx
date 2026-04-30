import Link from "next/link";
import CopyButton from "@/components/CopyButton";

const PLUGIN_INSTALL = `/plugin marketplace add LAWTED/cv
/plugin install cv@cv`;

const MCP_DIRECT = `claude mcp add cv --transport http https://cv.ha7ch.com/api/mcp \\
  --header "Authorization: Bearer cv_pat_xxxxxxxxxxxxxxxxxxxxxxxx"`;

const SET_TOKEN = `export CV_TOKEN=cv_pat_xxxxxxxxxxxxxxxxxxxxxxxx`;

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="font-serif text-5xl tracking-tight text-zinc-900">
        cv
      </h1>
      <p className="mt-3 text-lg text-zinc-600">
        Turn a PDF resume into a living personal site. Drop a PDF in Claude
        Code or Codex — your page at{" "}
        <span className="font-mono text-zinc-900">
          cv.ha7ch.com/{"{handle}"}
        </span>{" "}
        updates instantly.
      </p>

      <p className="mt-3 text-sm text-zinc-500">
        Live demo:{" "}
        <Link
          href="/admin"
          className="text-zinc-900 underline-offset-4 hover:underline"
        >
          cv.ha7ch.com/admin
        </Link>
      </p>

      <hr className="my-12 border-zinc-200" />

      <Step n={1} title="Get a token">
        <p className="text-zinc-600">
          Sign in at{" "}
          <Link
            href="/admin/login"
            className="text-zinc-900 underline-offset-4 hover:underline"
          >
            /admin/login
          </Link>
          , go to <span className="font-mono text-sm">Tokens</span>, and
          generate a personal access token. It looks like{" "}
          <code className="rounded bg-zinc-100 px-1 font-mono text-sm">
            cv_pat_…
          </code>
          .
        </p>
      </Step>

      <Step n={2} title="Install in Claude Code">
        <p className="mb-3 text-zinc-600">
          Recommended — the plugin ships skills and slash commands that teach
          Claude what to do:
        </p>
        <Code value={PLUGIN_INSTALL} />

        <p className="mt-6 mb-3 text-zinc-600">
          Or if you want a one-shot setup without the plugin layer (works in
          Claude Code, Codex, and Cursor — paste your token inline):
        </p>
        <Code value={MCP_DIRECT} />
      </Step>

      <Step n={3} title="Tell Claude your token">
        <p className="mb-3 text-zinc-600">
          The plugin reads <code className="font-mono text-sm">$CV_TOKEN</code>.
          Add it to your shell profile so Claude Code picks it up:
        </p>
        <Code value={SET_TOKEN} />
      </Step>

      <Step n={4} title="Update your resume">
        <p className="text-zinc-600">
          In any Claude Code session, drop your PDF into the chat and say:
        </p>
        <blockquote className="mt-3 border-l-2 border-zinc-300 bg-zinc-50 px-4 py-3 italic text-zinc-700">
          Update my resume with this PDF.
        </blockquote>
        <p className="mt-3 text-zinc-600">
          Claude reads the PDF natively, extracts the structured shape, and
          publishes a new version. Your live page updates within seconds.
        </p>
      </Step>

      <hr className="my-12 border-zinc-200" />

      <section className="space-y-3 text-sm text-zinc-500">
        <p>
          Auth model is PAT in v0.1 — simple bearer token, generate as many as
          you like. v1.0 will move to OAuth 2.1.
        </p>
        <p>
          Source:{" "}
          <a
            href="https://github.com/LAWTED/cv"
            className="underline-offset-4 hover:text-zinc-900 hover:underline"
          >
            github.com/LAWTED/cv
          </a>
        </p>
      </section>
    </main>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 flex items-baseline gap-3">
        <span className="font-serif text-sm tabular-nums text-zinc-400">
          0{n}
        </span>
        <span className="font-serif text-2xl text-zinc-900">{title}</span>
      </h2>
      {children}
    </section>
  );
}

function Code({ value }: { value: string }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 pr-20 text-sm leading-relaxed text-zinc-800">
        <code className="font-mono">{value}</code>
      </pre>
      <CopyButton text={value} />
    </div>
  );
}
