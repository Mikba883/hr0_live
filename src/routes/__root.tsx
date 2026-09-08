import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { CookieBanner } from "../components/CookieBanner";
import { usePageTracking } from "../hooks/use-page-tracking";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getConsentSnapshot, hydrateConsent } from "../lib/consent";
import { applyAnalyticsConsent } from "../lib/analytics";
import { applyAdsConsent } from "../lib/google-ads";
import { initConsentMode } from "../lib/gtag";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-semibold text-ink">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-ink">Pagina non trovata</h2>
        <p className="mt-2 text-sm text-ink-soft">
          La pagina che cerchi non esiste o è stata spostata.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/costo"
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Vai al check-up
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-ink">Qualcosa è andato storto</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Riprova tra un istante o torna alla pagina principale.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Riprova
          </button>
          <a
            href="/costo"
            className="inline-flex items-center justify-center rounded-full border border-hairline bg-white px-5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface"
          >
            Vai al check-up
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Check-up Assunzioni gratuito per PMI" },
      {
        name: "description",
        content:
          "Call diagnostica di 30 minuti per capire quanto ti costa assumere male e come ridurre il costo.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Check-up Assunzioni" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Il `?v=2` non è un vezzo: per mesi allo stesso identico indirizzo
      // (/favicon.ico) è stata servita l'icona di Lovable, e le favicon
      // finiscono in una cache del browser che il ricaricamento normale non
      // tocca. Finché l'URL resta uguale continua a comparire il cuore
      // arancione anche a file sostituito. Cambiando la stringa cambia la
      // chiave della cache. Se un domani cambi logo, alza il numero.
      { rel: "icon", href: "/favicon-96x96.png?v=2", type: "image/png", sizes: "96x96" },
      { rel: "icon", href: "/favicon.svg?v=2", type: "image/svg+xml" },
      { rel: "shortcut icon", href: "/favicon.ico?v=2" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=2", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest?v=2" },
      // I font sono serviti da noi (public/fonts, vedi src/fonts.css): caricarli
      // da fonts.googleapis.com mandava a Google l'IP di ogni visitatore prima
      // di qualunque consenso. Per aggiornarli: bun scripts/fetch-fonts.ts
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Visita, scroll e permanenza per ogni pagina pubblica. Qui e non nelle
  // singole route: montato una volta sola non si può dimenticare su una pagina.
  usePageTracking();

  // L'area riservata è privata e noindex: non ha senso mandarne le visite a
  // Google Ads, e senza tracciamento non c'è consenso da chiedere.
  const areaRiservata = pathname.startsWith("/admin");

  useEffect(() => {
    // Prima i segnali di consenso negati, poi tutto il resto: devono trovarsi
    // nel dataLayer prima che gtag.js possa girare, altrimenti il tag parte in
    // stato consentito.
    initConsentMode();
    hydrateConsent();

    // Qui si legge `window.location` e non `pathname`: questo effetto gira una
    // volta sola all'avvio, e il tag va deciso in base alla pagina d'ingresso.
    // `pathname` serve invece al render del banner, che deve seguire le
    // navigazioni.
    if (window.location.pathname.startsWith("/admin")) return;

    // Chi ha già scelto non rivede il banner: applichiamo la sua decisione.
    // Senza decisione, `false` non carica niente (o carica il tag Ads in stato
    // negato, se il consenso è configurato in modalità avanzata).
    const decisione = getConsentSnapshot().decision;
    applyAdsConsent(decisione?.marketing ?? false);
    applyAnalyticsConsent(decisione?.analytics ?? false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {areaRiservata ? null : <CookieBanner />}
    </QueryClientProvider>
  );
}
