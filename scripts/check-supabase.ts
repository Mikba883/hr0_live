/**
 * Verifica il collegamento a Supabase per il check-up.
 *
 *   bun run check:supabase                 → controlla tabella e permessi
 *   bun run check:supabase --insert-test   → prova anche una scrittura reale
 *
 * Legge VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY dal .env, esattamente
 * come fa il sito, così quello che vedi qui è quello che succede in produzione.
 */

const TABLE = "survey_responses";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const ok = (m: string) => console.log(`\x1b[32m✓\x1b[0m ${m}`);
const bad = (m: string) => console.log(`\x1b[31m✗\x1b[0m ${m}`);
const warn = (m: string) => console.log(`\x1b[33m!\x1b[0m ${m}`);
const info = (m: string) => console.log(`  ${m}`);

if (!url || !key) {
  bad("Mancano VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY nel .env");
  info("Le trovi su Supabase → Project Settings → API Keys.");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };
const rest = `${url.replace(/\/$/, "")}/rest/v1`;

console.log(`\nProgetto: ${url}`);
console.log(`Tabella:  public.${TABLE}\n`);

// ---- 1. La tabella esiste? Ed è leggibile dall'esterno? --------------------

let res: Response;
try {
  res = await fetch(`${rest}/${TABLE}?select=*&limit=1`, { headers });
} catch (e) {
  bad(`Non riesco a raggiungere Supabase: ${(e as Error).message}`);
  info("Controlla la connessione e che l'URL del progetto sia corretto.");
  process.exit(1);
}

const body = await res.text();

// Un proxy aziendale o un captive portal può rispondere al posto di Supabase:
// senza questo controllo un suo 403 verrebbe scambiato per "permesso negato",
// cioè per un setup corretto.
let payload: unknown;
try {
  payload = JSON.parse(body);
} catch {
  bad(`Chi ha risposto non è Supabase (HTTP ${res.status}).`);
  info(body.slice(0, 200) || "(risposta vuota)");
  info("Di solito è un proxy o una rete che blocca supabase.co. Riprova da un'altra rete.");
  process.exit(1);
}

const err = payload as { code?: string; message?: string };
const message = err.message ?? "";

if (res.status === 404 || err.code === "PGRST205" || /Could not find the table/i.test(message)) {
  bad("La tabella non esiste.");
  info("Ogni invio del check-up sta fallendo e i lead vanno persi.");
  info("Apri docs/SETUP_SUPABASE_SURVEY.md ed esegui lo SQL del punto 1.");
  process.exit(1);
}

if (/Invalid API key|JWT|apikey/i.test(message)) {
  bad("La chiave di Supabase non è valida.");
  info(message.slice(0, 200));
  info("Ricopiala da Supabase → Project Settings → API Keys dentro il .env.");
  process.exit(1);
}

if (err.code === "42501" || /permission denied/i.test(message)) {
  ok("La tabella esiste.");
  ok("La lettura dall'esterno è bloccata: i dati dei lead sono al sicuro.");
} else if (res.ok) {
  const rows = Array.isArray(payload) ? payload : [];
  ok("La tabella esiste.");
  if (rows.length > 0) {
    bad("ATTENZIONE: con la chiave pubblica riesco a leggere i dati dei lead.");
    info("Chiunque apra il sito può fare lo stesso: la chiave è visibile nel browser.");
    info("Rilancia il punto 1 di docs/SETUP_SUPABASE_SURVEY.md per rimettere a posto");
    info("permessi e RLS, poi ricontrolla con questo comando.");
    process.exit(1);
  }
  warn("La lettura non dà errore ma non restituisce righe.");
  info("Vuol dire che la RLS sta bloccando (bene) oppure che la tabella è vuota.");
  info("Per sciogliere il dubbio rilancia con --insert-test.");
} else {
  bad(`Risposta inattesa da Supabase (HTTP ${res.status}).`);
  info(body.slice(0, 300));
  process.exit(1);
}

// ---- 2. Scrittura di prova (opzionale) ------------------------------------

if (!process.argv.includes("--insert-test")) {
  console.log("\nPer provare anche una scrittura reale: bun run check:supabase --insert-test\n");
  process.exit(0);
}

console.log("\nProvo una scrittura di prova…\n");

const testRow = {
  nome: "TEST — verifica setup",
  azienda: "TEST",
  ruolo: "Titolare",
  email: "test@example.com",
  telefono: "+390000000000",
  dipendenti: "1-10",
  settore: "TEST",
  assumere_12m: "No",
  momento_azienda: "Stabile",
  ruolo_aperto: "No, ragiono sul medio periodo",
  chi_se_ne_occupa: "Io titolare",
  frustrazioni: ["Tempi lunghi"],
  consenso_privacy: true,
  source: "check-supabase-script",
};

const ins = await fetch(`${rest}/${TABLE}`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json", Prefer: "return=representation" },
  body: JSON.stringify(testRow),
});

const insBody = await ins.text();

if (!ins.ok) {
  bad(`La scrittura è fallita (HTTP ${ins.status}).`);
  info(insBody.slice(0, 400));
  info("");
  info("È esattamente l'errore che vedono i tuoi visitatori quando compilano il form.");
  info("Rilancia lo SQL del punto 1 di docs/SETUP_SUPABASE_SURVEY.md.");
  process.exit(1);
}

ok("Scrittura riuscita: il check-up salva correttamente le risposte.");

if (insBody.trim() && insBody.trim() !== "[]") {
  bad("ATTENZIONE: dopo l'insert Supabase mi ha restituito la riga appena scritta.");
  info("Significa che la chiave pubblica può rileggere i dati: la RLS non sta proteggendo.");
  info("Rilancia il punto 1 di docs/SETUP_SUPABASE_SURVEY.md.");
} else {
  ok("La riga scritta non mi viene restituita: la protezione in lettura funziona.");
}

info("");
info("Ora vai su Table Editor → survey_responses: trovi la riga 'TEST — verifica setup'.");
info("Se la vedi, il giro è completo. Cancellala pure.");
console.log("");
