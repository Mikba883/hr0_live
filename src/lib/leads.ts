/**
 * Logica dei lead del check-up: tipi, priorità, filtri, export.
 *
 * Tutto quello che qui dentro non tocca React sta separato dalla pagina
 * apposta: sono le regole con cui decidi chi richiamare per primo, e devono
 * restare leggibili senza aprire il markup.
 */

export type Stato = "nuovo" | "contattato" | "fissato" | "vinto" | "perso";

/** Gli stati ancora in gioco: non vinti, non persi. */
export const STATI_APERTI: Stato[] = ["nuovo", "contattato", "fissato"];

export const eChiuso = (stato: Stato) => stato === "vinto" || stato === "perso";

export type Lead = {
  id: string;
  created_at: string;
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
  frustrazioni: string[] | null;
  obiettivo_call: string | null;
  orario_preferito: string | null;
  consenso_privacy: boolean;
  source: string | null;
  utm: Record<string, string> | null;
  stato: Stato;
  note: string | null;
  contattato_at: string | null;
  /** Perché l'hai perso. Valorizzato solo quando stato = "perso". */
  motivo_perdita: string | null;
  /** Data (YYYY-MM-DD) del prossimo passo che ti sei segnato. */
  prossimo_contatto: string | null;
  /** Quando è finito in "vinto" o "perso". */
  chiuso_at: string | null;
};

export const STATI: { value: Stato; label: string; dot: string; chip: string }[] = [
  { value: "nuovo", label: "Da contattare", dot: "bg-brand", chip: "bg-info-bg text-brand" },
  {
    value: "contattato",
    label: "Contattato",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700",
  },
  {
    value: "fissato",
    label: "Call fissata",
    dot: "bg-sky-500",
    chip: "bg-sky-50 text-sky-700",
  },
  {
    value: "vinto",
    label: "Vinto",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700",
  },
  { value: "perso", label: "Perso", dot: "bg-ink-soft/40", chip: "bg-hairline text-ink-soft" },
];

/**
 * Perché un lead si perde. Chiederlo al momento della chiusura è l'unica
 * differenza fra un archivio di lead morti e un dato che ti dice dove stai
 * perdendo: senza questo campo, "perso" non insegna niente.
 */
export const MOTIVI_PERDITA = [
  "Non risponde più",
  "Non era in target",
  "Budget insufficiente",
  "Ha scelto un concorrente",
  "Tempi non compatibili",
  "Ha risolto internamente",
  "Altro",
];

export const statoInfo = (stato: Stato) => STATI.find((s) => s.value === stato) ?? STATI[0];

// -------------------- priorità --------------------

/**
 * Quanto vale la pena richiamare questo lead, adesso.
 *
 * Il punteggio somma tre segnali dichiarati dal lead stesso nel form: quanto
 * gli serve la persona (urgenza), quante ne deve assumere entro l'anno, e se
 * ha già una posizione aperta. Nessuna magia: se cambi le opzioni del form,
 * aggiorna anche queste tabelle.
 */
const PESO_URGENZA: Record<string, number> = {
  "Serviva ieri": 3,
  "Entro 1 mese": 2,
  "Entro 3 mesi": 1,
};

const PESO_VOLUME: Record<string, number> = {
  "Sì, più di 3": 3,
  "Sì, 2-3 persone": 2,
  "Sì, 1 persona": 1,
};

const PESO_RUOLO_APERTO: Record<string, number> = {
  "Sì, più di uno": 2,
  "Sì, uno": 1,
};

export type Priorita = { score: number; label: string; chip: string };

export function priorita(lead: Lead): Priorita {
  const score =
    (PESO_URGENZA[lead.urgenza ?? ""] ?? 0) +
    (PESO_VOLUME[lead.assumere_12m] ?? 0) +
    (PESO_RUOLO_APERTO[lead.ruolo_aperto] ?? 0);

  if (score >= 5) return { score, label: "Alta", chip: "bg-danger/10 text-danger" };
  if (score >= 3) return { score, label: "Media", chip: "bg-amber-50 text-amber-700" };
  return { score, label: "Bassa", chip: "bg-hairline text-ink-soft" };
}

// -------------------- follow-up --------------------

/** Oggi in formato YYYY-MM-DD, per confrontarlo con le colonne `date`. */
export function oggiISO(): string {
  const d = new Date();
  const mese = String(d.getMonth() + 1).padStart(2, "0");
  const giorno = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mese}-${giorno}`;
}

export type Followup = "nessuno" | "futuro" | "oggi" | "ritardo";

/**
 * Un lead aperto con la data del prossimo passo già scaduta è il modo tipico
 * di perdere una trattativa senza accorgersene: lo distinguiamo da quelli
 * ancora in tempo per poterlo mostrare in rosso.
 */
export function followup(lead: Lead): Followup {
  if (!lead.prossimo_contatto || eChiuso(lead.stato)) return "nessuno";
  const oggi = oggiISO();
  if (lead.prossimo_contatto < oggi) return "ritardo";
  if (lead.prossimo_contatto === oggi) return "oggi";
  return "futuro";
}

// -------------------- periodo --------------------

export type Periodo = "tutti" | "oggi" | "7g" | "30g" | "90g" | "custom";

export const PERIODI: { value: Periodo; label: string }[] = [
  { value: "tutti", label: "Sempre" },
  { value: "oggi", label: "Oggi" },
  { value: "7g", label: "7 giorni" },
  { value: "30g", label: "30 giorni" },
  { value: "90g", label: "90 giorni" },
  { value: "custom", label: "Date scelte" },
];

const GIORNI: Partial<Record<Periodo, number>> = { oggi: 1, "7g": 7, "30g": 30, "90g": 90 };

/**
 * Filtra per data di arrivo del lead. `da` e `a` (YYYY-MM-DD) valgono solo con
 * periodo "custom"; `a` è inclusivo, cioè comprende tutta la giornata indicata.
 */
export function nelPeriodo(lead: Lead, periodo: Periodo, da?: string, a?: string): boolean {
  if (periodo === "tutti") return true;

  if (periodo === "custom") {
    const giorno = lead.created_at.slice(0, 10);
    if (da && giorno < da) return false;
    if (a && giorno > a) return false;
    return true;
  }

  const giorni = GIORNI[periodo];
  if (!giorni) return true;
  const inizio = new Date();
  inizio.setHours(0, 0, 0, 0);
  inizio.setDate(inizio.getDate() - (giorni - 1));
  return new Date(lead.created_at).getTime() >= inizio.getTime();
}

// -------------------- fotografia d'insieme --------------------

export type Riepilogo = {
  totale: number;
  inPipeline: number;
  daRichiamare: number;
  vinti: number;
  persi: number;
  /** Percentuale di trattative chiuse che hai vinto. null se non ne hai chiusa nessuna. */
  conversione: number | null;
};

export function riepilogo(leads: Lead[]): Riepilogo {
  const vinti = leads.filter((l) => l.stato === "vinto").length;
  const persi = leads.filter((l) => l.stato === "perso").length;
  const chiusi = vinti + persi;

  return {
    totale: leads.length,
    inPipeline: leads.filter((l) => !eChiuso(l.stato)).length,
    daRichiamare: leads.filter((l) => {
      const f = followup(l);
      return f === "ritardo" || f === "oggi";
    }).length,
    vinti,
    persi,
    conversione: chiusi === 0 ? null : Math.round((vinti / chiusi) * 100),
  };
}

// -------------------- ricerca e ordinamento --------------------

export function cercaLead(lead: Lead, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  return [lead.nome, lead.azienda, lead.email, lead.telefono, lead.settore, lead.ruolo_quale]
    .filter(Boolean)
    .some((campo) => String(campo).toLowerCase().includes(query));
}

export type Ordine = "recenti" | "priorita" | "followup";

export function ordinaLead(leads: Lead[], ordine: Ordine): Lead[] {
  const copia = [...leads];

  if (ordine === "followup") {
    // Chi ha una data segnata viene prima, dal più scaduto in giù; chi non ha
    // un prossimo passo finisce in fondo, ordinato per data di arrivo.
    return copia.sort((a, b) => {
      const da = a.prossimo_contatto;
      const db = b.prossimo_contatto;
      if (da && db) return da.localeCompare(db);
      if (da) return -1;
      if (db) return 1;
      return b.created_at.localeCompare(a.created_at);
    });
  }

  if (ordine === "priorita") {
    return copia.sort((a, b) => {
      const diff = priorita(b).score - priorita(a).score;
      return diff !== 0 ? diff : b.created_at.localeCompare(a.created_at);
    });
  }
  return copia.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// -------------------- formattazione --------------------

export function dataEstesa(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** `2026-08-14` → `14/08/2026`. Per le colonne `date`, senza fuso orario di mezzo. */
export function dataBreve(giorno: string): string {
  const [anno, mese, gg] = giorno.slice(0, 10).split("-");
  return `${gg}/${mese}/${anno}`;
}

export function daQuanto(iso: string): string {
  const minuti = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minuti < 1) return "adesso";
  if (minuti < 60) return `${minuti} min fa`;
  const ore = Math.floor(minuti / 60);
  if (ore < 24) return `${ore} ${ore === 1 ? "ora" : "ore"} fa`;
  const giorni = Math.floor(ore / 24);
  if (giorni === 1) return "ieri";
  if (giorni < 30) return `${giorni} giorni fa`;
  const mesi = Math.floor(giorni / 30);
  return `${mesi} ${mesi === 1 ? "mese" : "mesi"} fa`;
}

/** Numero pulito per i link tel: e WhatsApp (che vuole il prefisso senza +). */
export function telPulito(telefono: string): string {
  const solo = telefono.replace(/[^\d+]/g, "");
  if (solo.startsWith("+")) return solo;
  if (solo.startsWith("00")) return `+${solo.slice(2)}`;
  return `+39${solo}`;
}

// -------------------- export CSV --------------------

const COLONNE: { key: keyof Lead | "priorita"; label: string }[] = [
  { key: "created_at", label: "Data" },
  { key: "stato", label: "Stato" },
  { key: "priorita", label: "Priorità" },
  { key: "nome", label: "Nome" },
  { key: "azienda", label: "Azienda" },
  { key: "ruolo", label: "Ruolo" },
  { key: "email", label: "Email" },
  { key: "telefono", label: "Telefono" },
  { key: "dipendenti", label: "Dipendenti" },
  { key: "settore", label: "Settore" },
  { key: "assumere_12m", label: "Assunzioni 12 mesi" },
  { key: "momento_azienda", label: "Momento azienda" },
  { key: "ruolo_aperto", label: "Ruolo aperto" },
  { key: "ruolo_quale", label: "Quale ruolo" },
  { key: "urgenza", label: "Urgenza" },
  { key: "tempo_scoperto", label: "Da quanto scoperto" },
  { key: "prima_volta", label: "Prima volta" },
  { key: "chi_se_ne_occupa", label: "Chi se ne occupa" },
  { key: "frustrazioni", label: "Frustrazioni" },
  { key: "obiettivo_call", label: "Obiettivo call" },
  { key: "motivo_perdita", label: "Motivo perdita" },
  { key: "prossimo_contatto", label: "Prossimo contatto" },
  { key: "contattato_at", label: "Primo contatto" },
  { key: "chiuso_at", label: "Chiuso il" },
  { key: "note", label: "Note" },
  { key: "source", label: "Provenienza" },
  { key: "utm", label: "Campagna" },
];

/** `{utm_source: "google", utm_medium: "cpc"}` → `source: google · medium: cpc` */
export function campagna(utm: Record<string, string> | null): string {
  if (!utm) return "";
  return Object.entries(utm)
    .map(([k, v]) => `${k.replace("utm_", "")}: ${v}`)
    .join(" · ");
}

const COLONNE_DATA_ORA = new Set(["created_at", "contattato_at", "chiuso_at"]);

function cella(lead: Lead, key: (typeof COLONNE)[number]["key"]): string {
  if (key === "priorita") return priorita(lead).label;
  const valore = lead[key];
  if (valore == null) return "";
  if (COLONNE_DATA_ORA.has(key)) return dataEstesa(String(valore));
  if (key === "prossimo_contatto") return dataBreve(String(valore));
  if (key === "utm") return campagna(valore as Record<string, string>);
  if (Array.isArray(valore)) return valore.join(" | ");
  if (typeof valore === "object") return JSON.stringify(valore);
  return String(valore);
}

/**
 * CSV con separatore `;` e BOM: è il formato che Excel in italiano apre in
 * colonne senza chiedere niente.
 */
export function leadsToCsv(leads: Lead[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const righe = [
    COLONNE.map((c) => esc(c.label)).join(";"),
    ...leads.map((lead) => COLONNE.map((c) => esc(cella(lead, c.key))).join(";")),
  ];
  return `\uFEFF${righe.join("\r\n")}`;
}

export function scaricaCsv(leads: Lead[]): void {
  const blob = new Blob([leadsToCsv(leads)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lead-check-up-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
