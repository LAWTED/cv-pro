import RegisterFlow from "@/components/RegisterFlow";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16 md:py-24">
      <h1 className="font-serif text-5xl tracking-tight">ai-cv</h1>
      <p className="mt-2 text-muted-foreground">AI-native resume.</p>

      <div className="mt-10">
        <RegisterFlow />
      </div>

      <footer className="mt-14">
        <a href="https://github.com/LAWTED/ai-cv" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
          <Github className="h-4 w-4" />
        </a>
      </footer>
    </main>
  );
}
