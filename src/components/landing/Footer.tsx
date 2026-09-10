import { Link } from "@tanstack/react-router";

import { openConsentPreferences } from "@/lib/consent";
import { GA4_ID } from "@/lib/analytics";
import { GOOGLE_ADS_ID } from "@/lib/google-ads";
import { CONSENSO_RICHIESTO } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-white">
      <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-ink-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-brand">Privacy policy</Link>
            <Link to="/cookie" className="hover:text-brand">Cookie policy</Link>
            {/*
              Il consenso dev'essere revocabile con la stessa facilità con cui è
              stato dato: senza questo link il banner sarebbe una porta a senso
              unico, e la Cookie Policy prometterebbe una cosa che non esiste.

              Senza nessuno strumento opzionale configurato non c'è niente da
              autorizzare e il banner non compare: il link aprirebbe il vuoto.
              Stessa ragione con CONSENSO_RICHIESTO a `false`: non c'è nessuna
              preferenza da riaprire, e un pulsante che non fa niente è peggio
              di un pulsante che non c'è.
            */}
            {CONSENSO_RICHIESTO && (GOOGLE_ADS_ID || GA4_ID) ? (
              <button
                type="button"
                onClick={openConsentPreferences}
                className="cursor-pointer hover:text-brand"
              >
                Preferenze cookie
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
