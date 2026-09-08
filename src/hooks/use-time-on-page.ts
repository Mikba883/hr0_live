import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

/** Soglie in secondi di permanenza attiva. Ognuna viene segnalata una volta sola. */
const SOGLIE = [10, 30, 60, 180] as const;

/** Sotto un secondo non c'è niente da raccontare: l'evento sarebbe solo rumore. */
const MINIMO_MS = 1000;

/**
 * `setTimeout` può scattare qualche millisecondo in anticipo. Senza tolleranza
 * la soglia risulterebbe non ancora raggiunta e verrebbe rimandata a un giro
 * successivo che non arriva mai, perché il timer era l'ultimo programmato.
 */
const TOLLERANZA_MS = 50;

/**
 * Quanto a lungo è rimasto davvero su questa pagina chi la sta guardando.
 *
 * Misura il tempo **attivo**, non quello trascorso: il cronometro si ferma
 * quando la scheda finisce in secondo piano. È la differenza fra "ha letto per
 * tre minuti" e "ha lasciato la scheda aperta mentre faceva altro", e senza
 * questa distinzione il dato diventa una misura di quante schede tiene aperte
 * la gente.
 *
 * Manda due cose diverse, e servono entrambe:
 *
 * - **`time_on_page`** alle soglie di 10/30/60/180 secondi. È il numero
 *   leggibile senza configurare niente: quanti hanno superato il minuto si
 *   conta contando gli eventi.
 * - **`page_engagement`** quando la pagina viene lasciata o messa da parte, con
 *   i secondi *di quel tratto*. È incrementale, come lo `user_engagement` di
 *   GA4: chi esce e rientra ne manda più d'uno, e nei report **va sommato**,
 *   non mediato. Mandare ogni volta il totale cumulativo gonfierebbe la somma.
 *
 * Con `pagina` a `null` non fa niente: è così che il tracciamento resta spento
 * finché manca il consenso, invece di tenere timer accesi per eventi che
 * verrebbero scartati comunque.
 */
export function useTimeOnPage(pagina: string | null) {
  useEffect(() => {
    if (!pagina) return;

    /** Millisecondi attivi già chiusi, cioè al netto del tratto in corso. */
    let accumulato = 0;
    /** Inizio del tratto in corso, `null` se il cronometro è fermo. */
    let da: number | null = document.visibilityState === "visible" ? Date.now() : null;
    /** Millisecondi già mandati con `page_engagement`. */
    let riportato = 0;
    const raggiunte = new Set<number>();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const attivo = () => accumulato + (da === null ? 0 : Date.now() - da);

    // Dichiarate come `function` e non come costanti: si chiamano a vicenda, e
    // in un verso o nell'altro una delle due userebbe l'altra prima che esista.
    function programma() {
      clearTimeout(timer);
      if (da === null) return;
      const prossima = SOGLIE.find((s) => !raggiunte.has(s));
      if (prossima === undefined) return;
      timer = setTimeout(scatta, Math.max(0, prossima * 1000 - attivo()));
    }

    function scatta() {
      const ms = attivo();
      // Un ciclo e non solo la soglia attesa: chi torna in primo piano dopo una
      // lunga pausa può averne superate più d'una nel frattempo.
      for (const soglia of SOGLIE) {
        if (raggiunte.has(soglia) || ms + TOLLERANZA_MS < soglia * 1000) continue;
        raggiunte.add(soglia);
        trackEvent("time_on_page", { secondi: soglia, pagina });
      }
      programma();
    }

    /** Ferma il cronometro e manda il tratto non ancora riportato. */
    function sospendi() {
      if (da !== null) {
        accumulato += Date.now() - da;
        da = null;
      }
      clearTimeout(timer);

      const delta = accumulato - riportato;
      if (delta < MINIMO_MS) return;
      riportato = accumulato;
      trackEvent("page_engagement", { secondi_attivi: Math.round(delta / 1000), pagina });
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        sospendi();
      } else if (da === null) {
        da = Date.now();
        programma();
      }
    };

    // `pagehide` e non `beforeunload`: su mobile quest'ultimo spesso non scatta
    // mai, e chi chiude la scheda dal telefono non verrebbe contato. Se
    // scattano entrambi il secondo non manda niente, perché il tratto è già
    // stato riportato.
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", sospendi);
    programma();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", sospendi);
      // Il cambio pagina è un'uscita a tutti gli effetti: qui si chiude il
      // conto, altrimenti navigando dentro il sito non si misurerebbe niente.
      sospendi();
    };
  }, [pagina]);
}
