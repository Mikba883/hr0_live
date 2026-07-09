import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-semibold text-ink">Privacy Policy</h1>
      <p className="mt-4 text-ink-soft">Contenuto da inserire.</p>
      <Link to="/costo" className="mt-8 inline-block text-brand hover:underline">← Torna al check-up</Link>
    </main>
  ),
});
