import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

type Search = { tel?: string };

export const Route = createFileRoute("/grazie")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tel: typeof s.tel === "string" ? s.tel : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Richiesta ricevuta — Check-up Assunzioni" },
      { name: "robots", content: "noindex,nofollow" },
      {
        name: "description",
        content: "Abbiamo ricevuto la tua richiesta. Ti ricontatto entro 48 ore.",
      },
    ],
  }),
  component: GraziePage,
});

function GraziePage() {
  const { tel } = Route.useSearch();

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-5 py-16">
      <div className="mx-auto w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <CheckCircle2 className="h-9 w-9 text-brand" strokeWidth={2} />
        </div>

        <h1 className="mt-6 text-4xl leading-tight text-ink sm:text-5xl">
          Fatto! Ho ricevuto le tue risposte.
        </h1>

        <p className="mt-6 text-lg text-ink-soft">
          Ti contatto <strong className="text-ink">entro 24-48 ore</strong>
          {tel ? (
            <>
              {" "}
              al numero <strong className="text-ink">{tel}</strong>
            </>
          ) : null}{" "}
          per fissare l'appuntamento del check-up.
        </p>

        <div className="mt-10 rounded-lg border border-hairline bg-white p-6 text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-ink-soft">
            Cosa succede ora
          </p>
          <ol className="mt-4 space-y-3 text-base text-ink-soft">
            <li>
              <span className="font-semibold text-ink">1.</span> Leggo le tue
              risposte e preparo la call sul tuo caso specifico.
            </li>
            <li>
              <span className="font-semibold text-ink">2.</span> Ti chiamo per
              concordare data e ora della videocall di 30 minuti.
            </li>
            <li>
              <span className="font-semibold text-ink">3.</span> Alla fine hai i
              tuoi numeri nero su bianco — che lavoriamo insieme o no.
            </li>
          </ol>
        </div>

        <div className="mt-10">
          <Link
            to="/costo"
            className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            ← Torna alla home
          </Link>
        </div>
      </div>
    </main>
  );
}
