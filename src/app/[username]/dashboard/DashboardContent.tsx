"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface Variant {
  audience: string;
  updatedAt: string;
}

const BASE_URL = "https://cv.ha7ch.com";
const STORAGE_KEY = "cv_token";

function guessParam(audience: string): string {
  if (audience === "en" || audience === "zh") return `lang=${audience}`;
  // simple heuristic: short known role names
  const roles = ["designer", "ml", "frontend", "backend", "product", "research", "researcher"];
  if (roles.includes(audience)) return `role=${audience}`;
  const topics = ["hci", "systems", "infra", "ai"];
  if (topics.includes(audience)) return `focus=${audience}`;
  return `company=${audience}`;
}

export default function DashboardPage() {
  const params = useParams();
  const username = params?.username as string;

  const [token, setToken] = useState<string>("");
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
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      if (!res.ok) {
        setError("Failed to load variants.");
        return;
      }
      const data: Variant[] = await res.json();
      setVariants(data);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setToken(stored);
      fetchVariants(stored);
    }
  }, [fetchVariants]);

  function handleLogin(e: React.SyntheticEvent) {
    e.preventDefault();
    const t = tokenInput.trim();
    if (!t.startsWith("cv_pat_")) {
      setError("Token must start with cv_pat_");
      return;
    }
    localStorage.setItem(STORAGE_KEY, t);
    setToken(t);
    setTokenInput("");
    fetchVariants(t);
  }

  async function handleDelete(audience: string) {
    if (!confirm(`Delete variant "${audience}"?`)) return;
    await fetch(`/api/v1/variants/${encodeURIComponent(audience)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setVariants((prev) => prev.filter((v) => v.audience !== audience));
  }

  function handleCopy(audience: string) {
    const param = guessParam(audience);
    const url = `${BASE_URL}/${username}?${param}`;
    navigator.clipboard.writeText(url);
    setCopied(audience);
    setTimeout(() => setCopied(""), 1500);
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-serif text-2xl mb-8">Dashboard</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            className="w-full rounded border px-3 py-2 text-sm font-mono bg-transparent"
            placeholder="cv_pat_..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="self-start rounded bg-foreground px-4 py-1.5 text-sm text-background"
          >
            Login
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="font-serif text-2xl">Variants</h1>
        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            setToken("");
            setVariants([]);
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Logout
        </button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && variants.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No variants yet.{" "}
          <span className="font-mono">cv-pro set-variant &lt;key&gt; [file]</span>
        </p>
      )}

      {variants.length > 0 && (
        <ul className="divide-y">
          {variants.map(({ audience, updatedAt }) => {
            const param = guessParam(audience);
            const url = `${BASE_URL}/${username}?${param}`;
            const date = updatedAt.slice(0, 10);
            return (
              <li key={audience} className="flex items-center gap-4 py-3 text-sm">
                <span className="font-mono w-28 shrink-0">{audience}</span>
                <span className="text-muted-foreground w-24 shrink-0">{date}</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground font-mono text-xs truncate flex-1"
                >
                  ?{param}
                </a>
                <button
                  onClick={() => handleCopy(audience)}
                  className="text-xs text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                >
                  {copied === audience ? "copied" : "copy"}
                </button>
                <button
                  onClick={() => handleDelete(audience)}
                  className="text-xs text-muted-foreground hover:text-red-500 shrink-0 transition-colors"
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
