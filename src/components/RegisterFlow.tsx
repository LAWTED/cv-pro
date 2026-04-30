"use client";

import { useState } from "react";
import Link from "next/link";

type Step = "idle" | "loading" | "success" | "error";

interface SuccessData {
  handle: string;
  token: string;
}

export default function RegisterFlow() {
  const [handle, setHandle] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<SuccessData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const h = handle.toLowerCase().trim();
    if (!h) return;
    setStep("loading");
    setErrorMsg("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: h }),
    });

    const data = await res.json();
    if (!res.ok) {
      setStep("error");
      setErrorMsg(data.error ?? "Something went wrong.");
      return;
    }
    setResult(data);
    setStep("success");
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  if (step === "success" && result) {
    const pluginCmd = `/plugin marketplace add LAWTED/cv\n/plugin install cv@cv`;
    const mcpCmd = `claude mcp add cv --transport http https://cv.ha7ch.com/api/mcp \\\n  --header "Authorization: Bearer ${result.token}"`;
    const envCmd = `export CV_TOKEN=${result.token}`;

    return (
      <div className="space-y-8">
        {/* Token reveal */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="mb-1 text-sm font-semibold text-amber-900">
            ✓ cv.ha7ch.com/{result.handle} is yours
          </p>
          <p className="mb-4 text-xs text-amber-700">
            Save your token — it won&apos;t be shown again.
          </p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-md border border-amber-200 bg-white px-4 py-3 pr-20 font-mono text-sm text-zinc-900">
              {result.token}
            </pre>
            <button
              onClick={() => copy(result.token, "token")}
              className="absolute right-2 top-2 rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-200"
            >
              {copied === "token" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Install — Option A */}
        <div>
          <h2 className="mb-1 font-serif text-xl">Option A — Plugin (recommended)</h2>
          <p className="mb-3 text-sm text-zinc-500">
            Ships a skill that guides Claude automatically. Run these in Claude Code:
          </p>
          <CodeBlock value={pluginCmd} id="plugin" copied={copied} onCopy={copy} />
          <p className="mt-3 text-sm text-zinc-500">
            Then set your token so the plugin can auth:
          </p>
          <CodeBlock value={envCmd} id="env-a" copied={copied} onCopy={copy} />
        </div>

        {/* Install — Option B */}
        <div>
          <h2 className="mb-1 font-serif text-xl">Option B — Direct MCP (Codex, Cursor…)</h2>
          <p className="mb-3 text-sm text-zinc-500">
            One command, works in any MCP-compatible client. Your token is already inline:
          </p>
          <CodeBlock value={mcpCmd} id="mcp" copied={copied} onCopy={copy} />
        </div>

        {/* Usage */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-5">
          <h2 className="mb-2 font-serif text-xl">Now use it</h2>
          <p className="text-sm text-zinc-600">
            In Claude Code, drop your PDF into the chat and say:
          </p>
          <blockquote className="mt-2 border-l-2 border-zinc-300 px-3 py-2 italic text-zinc-700">
            Update my resume with this PDF.
          </blockquote>
          <p className="mt-4 text-sm text-zinc-600">
            Your live page:{" "}
            <Link
              href={`/${result.handle}`}
              className="font-medium text-zinc-900 hover:underline underline-offset-4"
            >
              cv.ha7ch.com/{result.handle}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Pick a handle
        </label>
        <p className="mb-3 text-sm text-zinc-500">
          Your resume will live at{" "}
          <span className="font-mono text-zinc-700">
            cv.ha7ch.com/
            <span className="text-zinc-900">{handle || "your-handle"}</span>
          </span>
        </p>
        <div className="flex gap-2">
          <input
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              setStep("idle");
              setErrorMsg("");
            }}
            placeholder="your-handle"
            maxLength={30}
            required
            autoFocus
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 font-mono text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
          <button
            type="submit"
            disabled={step === "loading" || !handle}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            {step === "loading" ? "Claiming…" : "Get my token →"}
          </button>
        </div>
        {step === "error" && (
          <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
        )}
      </div>
    </form>
  );
}

function CodeBlock({
  value,
  id,
  copied,
  onCopy,
}: {
  value: string;
  id: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 pr-20 font-mono text-sm leading-relaxed text-zinc-800">
        <code>{value}</code>
      </pre>
      <button
        onClick={() => onCopy(value, id)}
        className="absolute right-2 top-2 rounded bg-white px-2 py-1 text-xs font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50"
      >
        {copied === id ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
