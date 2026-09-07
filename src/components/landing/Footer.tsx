import { Link } from "@tanstack/react-router";

import { openConsentPreferences } from "@/lib/consent";
import { GOOGLE_ADS_ID } from "@/lib/google-ads";

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

              Senza ID di conversione non c'è nessun tag da autorizzare e il
              banner non compare: mostrare il link aprirebbe il vuoto.
            */}
            {GOOGLE_ADS_ID ? (
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
