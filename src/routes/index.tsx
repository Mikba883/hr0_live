import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight text-foreground">hr0</h1>
        <p className="mt-3 text-sm text-muted-foreground">Empty project — ready to build.</p>
      </div>
    </main>
  );
}
