"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Variant {
  audience: string;
  updatedAt: string;
}

const BASE_URL = "https://cv.ha7ch.com";
const LS_KEY = "cv_registration";

function guessParam(audience: string): string {
  if (audience === "en" || audience === "zh") return `lang=${audience}`;
  const roles = ["designer", "ml", "frontend", "backend", "product", "research", "researcher"];
  if (roles.includes(audience)) return `role=${audience}`;
  const topics = ["hci", "systems", "infra", "ai"];
  if (topics.includes(audience)) return `focus=${audience}`;
  return `company=${audience}`;
}

export default function DashboardContent() {
  const params = useParams();
  const urlUsername = params?.username as string;

  const [token, setToken] = useState<string>("");
  const [handle, setHandle] = useState<string>("");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<string>("");

  const fetchVariants = useCallback(async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/variants", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401) {
        setError("Invalid token.");
        setToken("");
        localStorage.removeItem(LS_KEY);
        return;
      }
      if (!res.ok) { setError("Failed to load variants."); return; }
      setVariants(await res.json());
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { handle: string; token: string };
        if (p.token) {
          setToken(p.token);
          setHandle(p.handle);
          fetchVariants(p.token);
          return;
        }
      }
    } catch {}
  }, [fetchVariants]);

  function handleLogin(e: React.SyntheticEvent) {
    e.preventDefault();
    const t = tokenInput.trim();
    if (!t.startsWith("cv_pat_")) { setError("Token must start with cv_pat_"); return; }
    const h = urlUsername ?? "";
    localStorage.setItem(LS_KEY, JSON.stringify({ handle: h, token: t }));
    setToken(t);
    setHandle(h);
    setTokenInput("");
    fetchVariants(t);
  }

  async function handleDelete(audience: string) {
    if (!confirm(`Delete "${audience}"?`)) return;
    await fetch(`/api/v1/variants/${encodeURIComponent(audience)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setVariants((prev) => prev.filter((v) => v.audience !== audience));
  }

  function handleCopy(audience: string) {
    const param = guessParam(audience);
    const url = `${BASE_URL}/${handle || urlUsername}?${param}`;
    navigator.clipboard.writeText(url);
    setCopied(audience);
    setTimeout(() => setCopied(""), 1500);
  }

  const username = handle || urlUsername;

  if (!token) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] mb-10">
          Dashboard
        </h1>
        <form onSubmit={handleLogin} className="space-y-3 max-w-sm">
          <Input
            className="font-mono"
            placeholder="cv_pat_..."
            value={tokenInput}
            onChange={(e) => { setTokenInput(e.target.value); setError(""); }}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={!tokenInput.trim()}>
            Login →
          </Button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <div className="flex items-baseline justify-between mb-10">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1]">
          Variants
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href={`/${username}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {username}
            <ExternalLink className="h-3 w-3" />
          </Link>
          <button
            onClick={() => { localStorage.removeItem(LS_KEY); setToken(""); setVariants([]); }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && variants.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No variants yet —{" "}
          <span className="font-mono text-xs">cv-pro set-variant &lt;key&gt; [file]</span>
        </p>
      )}

      {variants.length > 0 && (
        <ul className="divide-y">
          {variants.map(({ audience, updatedAt }) => {
            const param = guessParam(audience);
            const url = `${BASE_URL}/${username}?${param}`;
            const date = updatedAt.slice(0, 10);
            return (
              <li key={audience} className="flex items-center gap-6 py-3.5 text-sm">
                <span className="font-mono w-28 shrink-0 font-medium">{audience}</span>
                <span className="text-muted-foreground w-24 shrink-0 text-xs">{date}</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground font-mono text-xs truncate flex-1 transition-colors"
                >
                  ?{param}
                </a>
                <button
                  onClick={() => handleCopy(audience)}
                  className="text-xs text-muted-foreground hover:text-foreground shrink-0 transition-colors w-10 text-right"
                >
                  {copied === audience ? "copied" : "copy"}
                </button>
                <button
                  onClick={() => handleDelete(audience)}
                  className="text-xs text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                >
                  delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
