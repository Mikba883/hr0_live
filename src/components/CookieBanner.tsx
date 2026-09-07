import { Link } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";

import { useConsent } from "@/hooks/use-consent";
import { closeConsentPreferences, hydrateConsent, saveConsent } from "@/lib/consent";
import { applyAdsConsent, GOOGLE_ADS_ID } from "@/lib/google-ads";

/**
 * Banner per il consenso ai cookie.
 *
 * Alcune scelte non sono estetiche ma vincoli delle linee guida del Garante
 * (10 giugno 2021), e conviene sapere quali sono prima di ritoccarle:
 *
 * - "Accetta tutto" e "Rifiuta tutto" hanno lo stesso identico peso grafico.
 *   Rendere il rifiuto meno visibile dell'accettazione è il rilievo più
 *   ricorrente nei provvedimenti sanzionatori.
 * - Non c'è nessuna X di chiusura: chiudere non è una scelta, e un banner che
 *   sparisce senza decidere finirebbe per equivalere a un consenso implicito.
 * - Il banner non copre la pagina e non blocca la navigazione. Un muro che
 *   costringe ad accettare per proseguire è un cookie wall, che è vietato.
 * - Nessuna casella è pre-spuntata: il consenso deve essere un atto positivo.
 */
export function CookieBanner() {
  const { shouldAsk, reopened, marketing } = useConsent();
  const [pronto, setPronto] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [marketingChecked, setMarketingChecked] = useState(false);
  const titleId = useId();
  const marketingId = useId();

  /**
   * Legge la scelta salvata e solo allora sblocca il render.
   *
   * Le due cose devono stare nello stesso effetto. Sul server lo storage non
   * esiste, quindi il markup inviato non contiene mai il banner: se il primo
   * render del client lo contenesse, React segnalerebbe una discrepanza di
   * idratazione. E se leggessimo la scelta in un effetto separato, chi ha già
   * deciso vedrebbe il banner comparire e sparire. Aggiornando entrambi qui
   * React raggruppa le due modifiche in un solo render.
   */
  useEffect(() => {
    hydrateConsent();
    setPronto(true);
  }, []);

  // Riaprendo dal footer il pannello mostra la scelta in vigore, non un
  // modulo vuoto: si arriva lì per cambiare qualcosa, non per ricominciare.
  useEffect(() => {
    if (!reopened) return;
    setShowDetails(true);
    setMarketingChecked(marketing);
  }, [reopened, marketing]);

  if (!pronto || !shouldAsk) return null;

  // Senza ID di conversione configurato non viene caricato niente: chiedere il
  // consenso per un tag che non esiste sarebbe solo un ostacolo in più.
  if (!GOOGLE_ADS_ID) return null;

  const decide = (accettato: boolean) => {
    const revoca = reopened && marketing && !accettato;
    saveConsent({ marketing: accettato });
    applyAdsConsent(accettato);
    setShowDetails(false);

    // Uno script già eseguito non si può disfare: dopo una revoca ricarichiamo
    // la pagina, così sparisce anche quello che il tag ha lasciato in memoria.
    if (revoca) window.location.reload();
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-5 sm:pb-5"
    >
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-hairline bg-white p-5 shadow-[0_20px_50px_-20px_rgba(11,18,32,0.45)] sm:p-6">
        <h2 id={titleId} className="text-base font-semibold text-ink">
          Cookie e strumenti di tracciamento
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Usiamo cookie tecnici, necessari al funzionamento del sito, e — solo con il tuo
          consenso — il tag di Google Ads, che ci permette di capire quali annunci portano
          davvero a una richiesta di check-up. Puoi accettare, rifiutare o scegliere per
          categoria. Trovi il dettaglio nella{" "}
          <Link to="/cookie" className="text-brand underline">
            Cookie Policy
          </Link>{" "}
          e nella{" "}
          <Link to="/privacy" className="text-brand underline">
            Privacy Policy
          </Link>
          .
        </p>

        {showDetails && (
          <div className="mt-5 space-y-3 border-t border-hairline pt-5">
            <div className="rounded-xl bg-surface px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Cookie tecnici</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Fanno funzionare il sito e ricordano questa scelta. Senza di loro il
                    sito non funziona, quindi non sono disattivabili.
                  </p>
                </div>
                <span className="mt-0.5 shrink-0 rounded-full bg-hairline px-3 py-1 text-xs font-semibold text-ink-soft">
                  Sempre attivi
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-surface px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <label htmlFor={marketingId} className="text-sm font-semibold text-ink">
                    Marketing e misurazione campagne
                  </label>
                  <p className="mt-1 text-sm text-ink-soft">
                    Tag di Google Ads: misura le conversioni delle campagne pubblicitarie.
                    Comporta cookie di profilazione di Google.
                  </p>
                </div>
                <input
                  id={marketingId}
                  type="checkbox"
                  checked={marketingChecked}
                  onChange={(e) => setMarketingChecked(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-brand"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          {/*
            I due pulsanti hanno la stessa classe: stessa dimensione, stesso
            contrasto, stesso ordine di lettura. Non è una svista di design.
          */}
          <button
            type="button"
            onClick={() => decide(true)}
            className="flex-1 cursor-pointer rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
          >
            Accetta tutto
          </button>
          <button
            type="button"
            onClick={() => decide(false)}
            className="flex-1 cursor-pointer rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
          >
            Rifiuta tutto
          </button>

          {showDetails ? (
            <button
              type="button"
              onClick={() => decide(marketingChecked)}
              className="flex-1 cursor-pointer rounded-full border border-hairline bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface"
            >
              Salva preferenze
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMarketingChecked(marketing);
                setShowDetails(true);
              }}
              className="flex-1 cursor-pointer rounded-full border border-hairline bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface"
            >
              Personalizza
            </button>
          )}
        </div>

        {reopened && (
          <button
            type="button"
            onClick={closeConsentPreferences}
            className="mt-3 w-full cursor-pointer text-center text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            Annulla, lascia com'è
          </button>
        )}
      </div>
    </div>
  );
}
