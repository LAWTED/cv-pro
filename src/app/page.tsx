import RegisterFlow from "@/components/RegisterFlow";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <h1 className="font-serif text-5xl tracking-tight text-zinc-900">cv</h1>
      <p className="mt-3 text-lg text-zinc-600">
        Turn your PDF resume into a living personal site. Claim a handle, get a
        token, and let Claude Code keep your page in sync.
      </p>

      <div className="mt-10">
        <RegisterFlow />
      </div>

      <footer className="mt-16 text-sm text-zinc-400">
        <a
          href="https://github.com/LAWTED/cv"
          className="hover:text-zinc-700"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/LAWTED/cv
        </a>
      </footer>
    </main>
  );
}
