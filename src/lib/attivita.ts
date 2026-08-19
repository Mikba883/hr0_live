/**
 * Le azioni che fai sui lead: telefonate, messaggi, email, incontri, note.
 *
 * È il pezzo che trasforma un elenco di contatti in un CRM. Senza uno storico
 * delle azioni sai *chi* devi richiamare ma non *cosa* hai già fatto, e a fine
 * mese non hai idea di quanto hai lavorato né dove si è fermata una trattativa.
 *
 * Il modello è quello che usano tutti i CRM, dai più semplici (OnePageCRM) agli
 * open source (EspoCRM, Twenty): una riga per ogni cosa fatta, agganciata al
 * lead, con il tipo e il momento in cui è successa.
 */

import { dataBreve, oggiISO, type Lead } from "./leads";

export type TipoAttivita = "chiamata" | "whatsapp" | "email" | "incontro" | "nota" | "stato";

export type Attivita = {
  id: string;
  lead_id: string;
  tipo: TipoAttivita;
  /** Com'è andata. Per il tipo "stato" lo scrive il sistema. */
  descrizione: string | null;
  fatta_at: string;
  autore: string | null;
};

export const TIPI: { value: TipoAttivita; label: string; chip: string }[] = [
  { value: "chiamata", label: "Chiamata", chip: "bg-info-bg text-brand" },
  { value: "whatsapp", label: "WhatsApp", chip: "bg-emerald-50 text-emerald-700" },
  { value: "email", label: "Email", chip: "bg-sky-50 text-sky-700" },
  { value: "incontro", label: "Incontro", chip: "bg-amber-50 text-amber-700" },
  { value: "nota", label: "Nota", chip: "bg-hairline text-ink-soft" },
  { value: "stato", label: "Stato", chip: "bg-hairline text-ink-soft" },
];

/** I tipi che scegli tu quando registri un'azione: "stato" lo scrive il sistema. */
export const TIPI_MANUALI = TIPI.filter((t) => t.value !== "stato");

export const tipoInfo = (tipo: TipoAttivita) => TIPI.find((t) => t.value === tipo) ?? TIPI[4];

// -------------------- raggruppamenti --------------------

/** `2026-08-19T09:30:00Z` → `2026-08-19`, per confrontare i giorni fra loro. */
export const giornoDi = (iso: string): string => iso.slice(0, 10);

/** `2026-08-19T09:30:00Z` → `2026-08`, per i totali del mese. */
export const meseDi = (iso: string): string => iso.slice(0, 7);

export type Giornata = { giorno: string; attivita: Attivita[] };

/**
 * Le attività raccolte giorno per giorno, dal più recente. È la forma con cui
 * si legge un diario di lavoro: "oggi ho fatto queste cose, ieri queste".
 */
export function perGiorno(attivita: Attivita[]): Giornata[] {
  const mappa = new Map<string, Attivita[]>();
  for (const a of attivita) {
    const g = giornoDi(a.fatta_at);
    const lista = mappa.get(g);
    if (lista) lista.push(a);
    else mappa.set(g, [a]);
  }
  return [...mappa.entries()]
    .map(([giorno, lista]) => ({
      giorno,
      attivita: lista.sort((x, y) => y.fatta_at.localeCompare(x.fatta_at)),
    }))
    .sort((x, y) => y.giorno.localeCompare(x.giorno));
}

// -------------------- andamento nel tempo --------------------

export type Granularita = "giorno" | "mese";

export type Barra = {
  /** Chiave del periodo: `2026-08-19` oppure `2026-08`. */
  chiave: string;
  etichetta: string;
  leadArrivati: number;
  azioni: number;
  vinti: number;
};

const MESI = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

function etichettaGiorno(chiave: string): string {
  const [, mese, gg] = chiave.split("-");
  return `${gg}/${mese}`;
}

function etichettaMese(chiave: string): string {
  const [anno, mese] = chiave.split("-");
  return `${MESI[Number(mese) - 1]} ${anno.slice(2)}`;
}

/**
 * `Date` → `YYYY-MM-DD` leggendo i componenti locali, non UTC.
 *
 * `toISOString()` qui sarebbe sbagliato: converte in UTC, e a seconda del fuso
 * il giorno slitterebbe di uno rispetto a quello che l'utente ha sullo schermo.
 */
function isoLocale(d: Date): string {
  const mese = String(d.getMonth() + 1).padStart(2, "0");
  const giorno = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mese}-${giorno}`;
}

/** Le ultime `quanti` chiavi di periodo, dalla più vecchia alla più recente. */
function chiaviRecenti(granularita: Granularita, quanti: number): string[] {
  const chiavi: string[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0); // mezzogiorno: evita che l'ora legale sposti il giorno

  for (let i = quanti - 1; i >= 0; i--) {
    if (granularita === "giorno") {
      const p = new Date(d);
      p.setDate(d.getDate() - i);
      chiavi.push(isoLocale(p));
      continue;
    }

    // Il mese si costruisce sempre dal giorno 1. Fare `setMonth(mese - i)` su
    // una data col giorno di oggi sbaglia ogni volta che il mese di arrivo è
    // più corto: il 31 maggio meno un mese diventa il 1º maggio, e aprile
    // sparirebbe dal grafico.
    const p = new Date(d.getFullYear(), d.getMonth() - i, 1);
    chiavi.push(isoLocale(p).slice(0, 7));
  }
  return chiavi;
}

/**
 * Lead arrivati, azioni fatte e trattative vinte, periodo per periodo.
 *
 * Include anche i periodi vuoti: un buco nel grafico è un'informazione
 * (quella settimana non hai chiamato nessuno), saltarlo la nasconderebbe.
 */
export function andamento(
  leads: Lead[],
  attivita: Attivita[],
  granularita: Granularita,
  quanti: number,
): Barra[] {
  const chiave = (iso: string) => (granularita === "giorno" ? giornoDi(iso) : meseDi(iso));
  const etichetta = granularita === "giorno" ? etichettaGiorno : etichettaMese;

  return chiaviRecenti(granularita, quanti).map((k) => ({
    chiave: k,
    etichetta: etichetta(k),
    leadArrivati: leads.filter((l) => chiave(l.created_at) === k).length,
    azioni: attivita.filter((a) => a.tipo !== "stato" && chiave(a.fatta_at) === k).length,
    vinti: leads.filter((l) => l.chiuso_at && l.stato === "vinto" && chiave(l.chiuso_at) === k)
      .length,
  }));
}

// -------------------- formattazione --------------------

/** `2026-08-19` → `Oggi` / `Ieri` / `19/08/2026`, come lo diresti a voce. */
export function nomeGiorno(giorno: string): string {
  const oggi = oggiISO();
  if (giorno === oggi) return "Oggi";

  const ieri = new Date();
  ieri.setDate(ieri.getDate() - 1);
  if (giorno === isoLocale(ieri)) return "Ieri";

  return dataBreve(giorno);
}

export function oraDi(iso: string): string {
  return new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}
