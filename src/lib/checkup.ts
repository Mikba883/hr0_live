/**
 * Invio delle risposte del check-up a Supabase.
 *
 * Perché qui non si usa il client condiviso di `@/lib/supabase`: quel client
 * tiene in memoria la sessione di chi ha fatto login su `/admin` e la allega a
 * ogni richiesta. Se apri `/check-up` nello stesso browser in cui sei loggato
 * come amministratore, la scrittura arriva a Postgres come utente
 * `authenticated`, mentre la policy che permette di inserire è scritta per
 * `anon` (vedi `docs/SETUP_SUPABASE_SURVEY.md`): la riga viene rifiutata dalla
 * row level security e il form risponde "non sono riuscito a salvare" anche se
 * il setup è perfetto.
 *
 * Chiamando la Data API direttamente con la sola chiave pubblica, il ruolo è
 * sempre `anon`: il form si comporta allo stesso modo per un visitatore e per
 * te che lo stai provando, in qualunque scheda del browser.
 */

const TABELLA = "survey_responses";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const chiavePubblica = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export type CheckUpPayload = {
  nome: string;
  azienda: string;
  ruolo: string;
  email: string;
  telefono: string;
  dipendenti: string;
  settore: string;
  assumere_12m: string;
  momento_azienda: string;
  ruolo_aperto: string;
  ruolo_quale: string | null;
  urgenza: string | null;
  tempo_scoperto: string | null;
  prima_volta: string | null;
  chi_se_ne_occupa: string;
  frustrazioni: string[];
  obiettivo_call: string | null;
  consenso_privacy: boolean;
  source: string | null;
  utm: Record<string, string> | null;
};

/**
 * `messaggio` è quello che legge chi ha compilato il form; `dettaglio` è la
 * riga tecnica che dice a te dov'è il guasto, senza dover aprire la console.
 */
export type EsitoInvio = { ok: true } | { ok: false; messaggio: string; dettaglio: string };

const RIPROVA = "Non sono riuscito a salvare le tue risposte. Riprova.";

type ErrorePostgrest = { code?: string; message?: string; details?: string; hint?: string };

/**
 * Traduce la risposta di PostgREST in due righe: una per chi sta compilando,
 * una per chi deve mettere le mani nel database.
 */
function spiega(status: number, errore: ErrorePostgrest, grezzo: string): EsitoInvio {
  const codice = errore.code ?? "";
  const testo = errore.message ?? grezzo.slice(0, 200);
  const dettaglio = [codice, testo].filter(Boolean).join(" · ");

  if (codice === "PGRST205" || /Could not find the table/i.test(testo)) {
    return {
      ok: false,
      messaggio: RIPROVA,
      dettaglio: `${dettaglio} — la tabella public.${TABELLA} non esiste: esegui lo SQL del punto 1 di docs/SETUP_SUPABASE_SURVEY.md`,
    };
  }

  if (codice === "PGRST204" || /column .* does not exist/i.test(testo)) {
    return {
      ok: false,
      messaggio: RIPROVA,
      dettaglio: `${dettaglio} — allo schema manca una colonna: rilancia lo SQL di docs/SETUP_SUPABASE_SURVEY.md`,
    };
  }

  if (codice === "42501" || /row-level security|permission denied/i.test(testo)) {
    return {
      ok: false,
      messaggio: RIPROVA,
      dettaglio: `${dettaglio} — manca il permesso di insert per il ruolo anon: rilancia lo SQL di docs/SETUP_SUPABASE_SURVEY.md`,
    };
  }

  if (status === 401 || /Invalid API key|JWT/i.test(testo)) {
    return {
      ok: false,
      messaggio: RIPROVA,
      dettaglio: `${dettaglio} — la chiave VITE_SUPABASE_PUBLISHABLE_KEY non è valida su questo ambiente`,
    };
  }

  return { ok: false, messaggio: RIPROVA, dettaglio: dettaglio || `HTTP ${status}` };
}

export async function salvaCheckUp(payload: CheckUpPayload): Promise<EsitoInvio> {
  if (!url || !chiavePubblica) {
    return {
      ok: false,
      messaggio: RIPROVA,
      dettaglio:
        "Mancano VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY nelle variabili d'ambiente di questo ambiente",
    };
  }

  let res: Response;
  try {
    res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${TABELLA}`, {
      method: "POST",
      headers: {
        apikey: chiavePubblica,
        Authorization: `Bearer ${chiavePubblica}`,
        "Content-Type": "application/json",
        // Senza rappresentazione in risposta: inserire non richiede il
        // permesso di lettura, che alla chiave pubblica è giustamente negato.
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return {
      ok: false,
      messaggio: "Non sono riuscito a raggiungere il server. Controlla la connessione e riprova.",
      dettaglio: (e as Error).message,
    };
  }

  if (res.ok) return { ok: true };

  const grezzo = await res.text();
  let errore: ErrorePostgrest = {};
  try {
    errore = JSON.parse(grezzo) as ErrorePostgrest;
  } catch {
    // Una risposta non JSON di solito è un proxy o una rete che si mette in
    // mezzo: lo lasciamo passare così com'è nel dettaglio.
  }
  return spiega(res.status, errore, grezzo);
}
