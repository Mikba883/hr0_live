import { createFileRoute } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  Clock,
  Compass,
  Download,
  Inbox,
  LayoutGrid,
  List,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Sun,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  campagna,
  cercaLead,
  daQuanto,
  dataBreve,
  dataEstesa,
  eChiuso,
  followup,
  MOTIVI_PERDITA,
  nelPeriodo,
  oggiISO,
  ordinaLead,
  PERIODI,
  priorita,
  riepilogo,
  scaricaCsv,
  STATI,
  statoInfo,
  telPulito,
  type Followup,
  type Lead,
  type Ordine,
  type Periodo,
  type Stato,
} from "@/lib/leads";
import { tipoInfo, type Attivita, type TipoAttivita } from "@/lib/attivita";
import { Agenda } from "@/components/admin/Agenda";
import { Andamento } from "@/components/admin/Andamento";
import { ModaleAzione, type AzioneFatta } from "@/components/admin/ModaleAzione";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Lead — Check-up Assunzioni" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

// -------------------- accesso --------------------

type Accesso =
  | { fase: "caricamento" }
  | { fase: "login" }
  // "setup" = la funzione is_admin() non esiste ancora: l'SQL della guida non
  // è stato lanciato. Dirgli "non sei autorizzato" lo manderebbe a cercare il
  // problema nel posto sbagliato.
  | { fase: "negato"; email: string; motivo: "non-admin" | "setup" }
  | { fase: "pronto"; email: string };

function AdminPage() {
  const [accesso, setAccesso] = useState<Accesso>({ fase: "caricamento" });

  // Tutta l'autenticazione vive nel browser: in SSR non esiste la sessione,
  // quindi il server rende solo lo stato di caricamento.
  useEffect(() => {
    let vivo = true;

    const valuta = async (email: string | undefined) => {
      if (!email) {
        if (vivo) setAccesso({ fase: "login" });
        return;
      }
      // La RLS già filtra le righe, ma senza questa domanda esplicita non
      // sapremmo distinguere "non sei autorizzato" da "non ci sono ancora lead".
      const { data, error } = await supabase.rpc("is_admin");
      if (!vivo) return;
      if (error) {
        console.error(error);
        setAccesso({ fase: "negato", email, motivo: "setup" });
      } else {
        setAccesso(
          data ? { fase: "pronto", email } : { fase: "negato", email, motivo: "non-admin" },
        );
      }
    };

    void supabase.auth.getSession().then(({ data }) => valuta(data.session?.user.email));

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sessione) => {
      void valuta(sessione?.user.email);
    });

    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (accesso.fase === "caricamento") {
    return (
      <Centrato>
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </Centrato>
    );
  }

  if (accesso.fase === "login") return <Login />;

  if (accesso.fase === "negato") {
    return (
      <Centrato>
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
            <Lock className="h-5 w-5 text-danger" />
          </div>
          <h1 className="mt-5 text-2xl text-ink">
            {accesso.motivo === "setup" ? "Setup non completato" : "Accesso non autorizzato"}
          </h1>
          {accesso.motivo === "setup" ? (
            <p className="mt-3 text-sm text-ink-soft">
              Il database non espone ancora la funzione <code>is_admin()</code>. Lancia il blocco
              SQL del punto 1 di <code>docs/SETUP_ADMIN_LEAD.md</code> e ricarica la pagina.
            </p>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">
              L'utente <strong className="text-ink">{accesso.email}</strong> non è tra gli
              amministratori. Aggiungi questa email alla tabella <code>admin_users</code> su
              Supabase per abilitarlo.
            </p>
          )}
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-6 text-sm font-semibold text-brand underline underline-offset-4"
          >
            Esci
          </button>
        </div>
      </Centrato>
    );
  }

  return <Dashboard email={accesso.email} />;
}

function Centrato({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-5">
      {children}
    </main>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [invio, setInvio] = useState(false);

  const entra = async (e: FormEvent) => {
    e.preventDefault();
    setInvio(true);
    setErrore(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setInvio(false);
    if (error) setErrore("Email o password non corretti.");
  };

  return (
    <Centrato>
      <form onSubmit={entra} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">
            Check-up Assunzioni
          </span>
          <h1 className="mt-3 text-3xl text-ink">I tuoi lead</h1>
          <p className="mt-2 text-sm text-ink-soft">Accedi per vedere chi ha compilato.</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-hairline bg-white p-6">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="mt-2 w-full rounded-xl border border-hairline px-4 py-3 text-base outline-none transition-colors focus:border-brand"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border border-hairline px-4 py-3 text-base outline-none transition-colors focus:border-brand"
            />
          </label>

          {errore && (
            <p className="flex items-center gap-2 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errore}
            </p>
          )}

          <button
            type="submit"
            disabled={invio}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:bg-hairline disabled:text-ink-soft"
          >
            {invio && <Loader2 className="h-4 w-4 animate-spin" />}
            Entra
          </button>
        </div>
      </form>
    </Centrato>
  );
}

// -------------------- dashboard --------------------

type Vista = "lista" | "pipeline";

/**
 * Le tre domande a cui la pagina risponde, in ordine di frequenza con cui te
 * le fai: cosa devo fare adesso, chi sono i lead, come sta andando.
 */
type Sezione = "oggi" | "lead" | "andamento";

const SEZIONI: { value: Sezione; label: string; icona: typeof Sun }[] = [
  { value: "oggi", label: "Oggi", icona: Sun },
  { value: "lead", label: "Lead", icona: List },
  { value: "andamento", label: "Andamento", icona: BarChart3 },
];

/** Chiusura in sospeso: il lead sta andando in "perso" e aspetta il motivo. */
type Chiusura = { lead: Lead } | null;

function Dashboard({ email }: { email: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  const [attivita, setAttivita] = useState<Attivita[]>([]);

  const [sezione, setSezione] = useState<Sezione>("oggi");
  const [vista, setVista] = useState<Vista>("lista");
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Stato | "tutti">("tutti");
  const [ordine, setOrdine] = useState<Ordine>("recenti");
  const [periodo, setPeriodo] = useState<Periodo>("tutti");
  const [da, setDa] = useState("");
  const [a, setA] = useState("");
  const [selezionato, setSelezionato] = useState<string | null>(null);
  const [chiusura, setChiusura] = useState<Chiusura>(null);
  /** Lead per cui stai registrando un'azione appena fatta. */
  const [azione, setAzione] = useState<Lead | null>(null);

  const carica = useCallback(async () => {
    setCaricamento(true);
    const [risposteLead, risposteAttivita] = await Promise.all([
      supabase.from("survey_responses").select("*").order("created_at", { ascending: false }),
      supabase.from("lead_attivita").select("*").order("fatta_at", { ascending: false }),
    ]);
    setCaricamento(false);

    if (risposteLead.error) {
      console.error(risposteLead.error);
      setErrore("Non riesco a caricare i lead.");
      return;
    }
    setLeads((risposteLead.data ?? []) as Lead[]);

    // Lo storico è un pezzo aggiunto dopo: se la tabella non c'è ancora la
    // pagina resta usabile e lo dice, invece di sembrare rotta.
    if (risposteAttivita.error) {
      console.error(risposteAttivita.error);
      setErrore(
        "Lo storico delle azioni non è attivo: lancia il blocco SQL di docs/SETUP_CRM_AGENDA.md.",
      );
      setAttivita([]);
      return;
    }
    setErrore(null);
    setAttivita((risposteAttivita.data ?? []) as Attivita[]);
  }, []);

  useEffect(() => {
    void carica();
  }, [carica]);

  const aggiorna = useCallback(
    async (id: string, patch: Partial<Lead>) => {
      // Applichiamo subito in locale così l'interfaccia non aspetta la rete;
      // se il salvataggio fallisce ricarichiamo dal database invece di
      // ricostruire a mano lo stato precedente, che potrebbe non essere più
      // quello giusto se nel frattempo è cambiato altro.
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
      const { error } = await supabase.from("survey_responses").update(patch).eq("id", id);
      if (error) {
        console.error(error);
        setErrore("Modifica non salvata. Riprova.");
        void carica();
      }
    },
    [carica],
  );

  /** Scrive una riga nello storico delle azioni. */
  const registra = useCallback(
    async (leadId: string, tipo: TipoAttivita, descrizione: string | null) => {
      const { data, error } = await supabase
        .from("lead_attivita")
        .insert({ lead_id: leadId, tipo, descrizione, autore: email })
        .select()
        .single();
      if (error) {
        console.error(error);
        setErrore("Azione non registrata. Riprova.");
        return;
      }
      setAttivita((prev) => [data as Attivita, ...prev]);
    },
    [email],
  );

  /**
   * Il giro completo di "Fatto": registra quello che hai fatto e nello stesso
   * gesto fissa il passo successivo. Sono una operazione sola apposta — è la
   * separazione fra i due che, in tutti i CRM, fa morire le trattative.
   */
  const registraAzione = useCallback(
    (lead: Lead, fatta: AzioneFatta) => {
      void registra(lead.id, fatta.tipo, fatta.descrizione);

      const patch: Partial<Lead> = {
        prossima_azione: fatta.prossimaAzione,
        prossimo_contatto: fatta.prossimoContatto,
      };

      // Aver davvero raggiunto qualcuno lo fa uscire da "da contattare". Una
      // nota no: appuntarsi una cosa non è aver parlato con il lead.
      if (lead.stato === "nuovo" && fatta.tipo !== "nota") {
        patch.stato = "contattato";
        patch.contattato_at = lead.contattato_at ?? new Date().toISOString();
      }

      void aggiorna(lead.id, patch);
    },
    [aggiorna, registra],
  );

  /**
   * Unico punto in cui un lead cambia stato, da qualunque parte arrivi il
   * comando (bottoni del dettaglio o trascinamento nella pipeline). Tiene
   * allineati i campi che dipendono dallo stato invece di lasciarli indietro.
   */
  const cambiaStato = useCallback(
    (lead: Lead, stato: Stato, motivo?: string) => {
      if (stato === lead.stato && !motivo) return;

      const patch: Partial<Lead> = { stato };
      if (stato !== "nuovo" && !lead.contattato_at) {
        patch.contattato_at = new Date().toISOString();
      }
      if (eChiuso(stato)) {
        patch.chiuso_at = lead.chiuso_at ?? new Date().toISOString();
        patch.prossimo_contatto = null; // una trattativa chiusa non si richiama
        patch.motivo_perdita = stato === "perso" ? (motivo ?? null) : null;
      } else {
        // Riaperto: torna in gioco, quindi niente data di chiusura né motivo.
        patch.chiuso_at = null;
        patch.motivo_perdita = null;
      }
      void aggiorna(lead.id, patch);
      void registra(
        lead.id,
        "stato",
        motivo ? `${statoInfo(stato).label} — ${motivo}` : statoInfo(stato).label,
      );
    },
    [aggiorna, registra],
  );

  /** In "perso" chiediamo prima il motivo; sugli altri stati si applica subito. */
  const richiediStato = useCallback(
    (lead: Lead, stato: Stato) => {
      if (stato === "perso" && lead.stato !== "perso") setChiusura({ lead });
      else cambiaStato(lead, stato);
    },
    [cambiaStato],
  );

  // Il periodo governa tutto: numeri in alto, liste e pipeline guardano
  // sempre la stessa fetta di tempo, altrimenti i conti non tornerebbero.
  const nelRange = useMemo(
    () => leads.filter((l) => nelPeriodo(l, periodo, da, a)),
    [leads, periodo, da, a],
  );

  // L'agenda e l'andamento parlano di adesso, non di una fetta di calendario:
  // lì i numeri guardano tutti i lead, altrimenti un periodo stretto
  // nasconderebbe proprio le trattative rimaste indietro.
  const insieme = useMemo(
    () => (sezione === "lead" ? nelRange : leads),
    [sezione, nelRange, leads],
  );

  const numeri = useMemo(() => riepilogo(insieme), [insieme]);

  const cercati = useMemo(() => nelRange.filter((l) => cercaLead(l, q)), [nelRange, q]);

  const visibili = useMemo(() => {
    const filtrati = cercati.filter((l) => filtro === "tutti" || l.stato === filtro);
    return ordinaLead(filtrati, ordine);
  }, [cercati, filtro, ordine]);

  /** Da agenda e diario si arriva sempre al dettaglio, che vive nella sezione Lead. */
  const apriLead = useCallback((id: string) => {
    setSezione("lead");
    setVista("lista");
    setSelezionato(id);
  }, []);

  const lead = leads.find((l) => l.id === selezionato) ?? null;

  const dettaglio = lead ? (
    <Dettaglio
      key={lead.id}
      lead={lead}
      attivita={attivita.filter((a) => a.lead_id === lead.id)}
      onChiudi={() => setSelezionato(null)}
      onStato={(stato) => richiediStato(lead, stato)}
      onAggiorna={(patch) => void aggiorna(lead.id, patch)}
      onFatto={() => setAzione(lead)}
    />
  ) : null;

  return (
    <main className="min-h-screen bg-surface">
      <header className="sticky top-0 z-20 border-b border-hairline bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand">
              Check-up Assunzioni
            </span>
            <h1 className="text-xl text-ink sm:text-2xl">I tuoi lead</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-ink-soft sm:block">{email}</span>
            <button
              onClick={() => carica()}
              title="Aggiorna"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink-soft transition-colors hover:bg-surface hover:text-ink"
            >
              <RefreshCw className={`h-4 w-4 ${caricamento ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              title="Esci"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink-soft transition-colors hover:bg-surface hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-[1600px] gap-1 px-5">
          {SEZIONI.map((sz) => {
            const Icona = sz.icona;
            const attiva = sezione === sz.value;
            return (
              <button
                key={sz.value}
                onClick={() => setSezione(sz.value)}
                className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  attiva
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                <Icona className="h-4 w-4" />
                {sz.label}
                {sz.value === "oggi" && numeri.daRichiamare > 0 && (
                  <span className="rounded-full bg-danger px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {numeri.daRichiamare}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-8">
        {/* La fotografia d'insieme, sempre relativa al periodo scelto */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Numero
            icona={<Inbox className="h-4 w-4" />}
            valore={numeri.inPipeline}
            etichetta="In pipeline"
          />
          <Numero
            icona={<Clock className="h-4 w-4" />}
            valore={numeri.daRichiamare}
            etichetta="Da richiamare"
            evidenzia={numeri.daRichiamare > 0}
          />
          <Numero
            icona={<Compass className="h-4 w-4" />}
            valore={numeri.allaDeriva}
            etichetta="Senza prossimo passo"
            evidenzia={numeri.allaDeriva > 0}
            nota="da tenere a zero"
          />
          <Numero icona={<Trophy className="h-4 w-4" />} valore={numeri.vinti} etichetta="Vinti" />
          <Numero
            icona={<TrendingUp className="h-4 w-4" />}
            valore={numeri.conversione === null ? "—" : `${numeri.conversione}%`}
            etichetta="Conversione"
            nota={
              numeri.conversione === null
                ? "nessuna chiusa"
                : `${numeri.vinti} su ${numeri.vinti + numeri.persi} chiuse`
            }
          />
        </div>

        {/* Periodo, ricerca e vista servono solo alla sezione Lead:
            l'agenda guarda sempre a oggi e l'andamento ha la sua scala. */}
        {sezione === "lead" && (
          <>
          {/* Periodo */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <CalendarDays className="h-4 w-4 text-ink-soft" />
            {PERIODI.map((p) => (
              <Chip key={p.value} attivo={periodo === p.value} onClick={() => setPeriodo(p.value)}>
                {p.label}
              </Chip>
            ))}
            {periodo === "custom" && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={da}
                  max={a || undefined}
                  onChange={(e) => setDa(e.target.value)}
                  className="rounded-full border border-hairline bg-white px-4 py-2 text-sm outline-none focus:border-brand"
                />
                <span className="text-sm text-ink-soft">→</span>
                <input
                  type="date"
                  value={a}
                  min={da || undefined}
                  onChange={(e) => setA(e.target.value)}
                  className="rounded-full border border-hairline bg-white px-4 py-2 text-sm outline-none focus:border-brand"
                />
                {(da || a) && (
                  <button
                    onClick={() => {
                      setDa("");
                      setA("");
                    }}
                    className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
                  >
                    Azzera
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Ricerca, vista, export */}
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cerca per nome, azienda, email, telefono…"
                className="w-full rounded-full border border-hairline bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-brand"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-full border border-hairline bg-white p-1">
                <BottoneVista attivo={vista === "lista"} onClick={() => setVista("lista")}>
                  <List className="h-4 w-4" />
                  Lista
                </BottoneVista>
                <BottoneVista attivo={vista === "pipeline"} onClick={() => setVista("pipeline")}>
                  <LayoutGrid className="h-4 w-4" />
                  Pipeline
                </BottoneVista>
              </div>

              {vista === "lista" && (
                <select
                  value={ordine}
                  onChange={(e) => setOrdine(e.target.value as Ordine)}
                  className="rounded-full border border-hairline bg-white px-4 py-3 text-sm font-semibold text-ink outline-none focus:border-brand"
                >
                  <option value="recenti">Più recenti</option>
                  <option value="priorita">Priorità</option>
                  <option value="followup">Da richiamare</option>
                </select>
              )}

              <button
                onClick={() => scaricaCsv(vista === "lista" ? visibili : cercati)}
                disabled={(vista === "lista" ? visibili : cercati).length === 0}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:text-ink-soft"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
            </div>
          </div>
          </>
        )}

        {errore && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errore}
          </div>
        )}

        {sezione === "oggi" && (
          <Agenda
            leads={leads}
            onApri={apriLead}
            onFatto={setAzione}
          />
        )}

        {sezione === "lead" && (
          <>
          {vista === "lista" ? (
            <>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                <Chip attivo={filtro === "tutti"} onClick={() => setFiltro("tutti")}>
                  Tutti ({cercati.length})
                </Chip>
                {STATI.map((s) => (
                  <Chip key={s.value} attivo={filtro === s.value} onClick={() => setFiltro(s.value)}>
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    {s.label} ({cercati.filter((l) => l.stato === s.value).length})
                  </Chip>
                ))}
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
                <div className={`space-y-2 ${lead ? "hidden lg:block" : ""}`}>
                  {caricamento && leads.length === 0 && (
                    <p className="rounded-2xl border border-hairline bg-white p-6 text-sm text-ink-soft">
                      Carico i lead…
                    </p>
                  )}
                  {!caricamento && visibili.length === 0 && <Vuoto totale={leads.length} />}
                  {visibili.map((l) => (
                    <RigaLead
                      key={l.id}
                      lead={l}
                      attivo={l.id === selezionato}
                      onClick={() => setSelezionato(l.id)}
                    />
                  ))}
                </div>

                <div className={lead ? "" : "hidden lg:block"}>
                  {dettaglio ?? (
                    <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-hairline bg-white p-8 text-center">
                      <p className="max-w-xs text-sm text-ink-soft">
                        Scegli un lead dalla lista per vedere tutte le risposte e richiamarlo.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Pipeline
              leads={cercati}
              selezionato={selezionato}
              onApri={setSelezionato}
              onSposta={richiediStato}
            />
          )}
          </>
        )}

        {sezione === "andamento" && (
          <Andamento leads={leads} attivita={attivita} onApri={apriLead} />
        )}
      </div>

      {/* In pipeline il dettaglio arriva come pannello laterale, per non
          far collassare le colonne. */}
      {vista === "pipeline" && lead && (
        <Pannello onChiudi={() => setSelezionato(null)}>{dettaglio}</Pannello>
      )}

      {azione && (
        <ModaleAzione
          lead={azione}
          onAnnulla={() => setAzione(null)}
          onConferma={(fatta) => {
            registraAzione(azione, fatta);
            setAzione(null);
          }}
        />
      )}

      {chiusura && (
        <ModaleMotivo
          lead={chiusura.lead}
          onAnnulla={() => setChiusura(null)}
          onConferma={(motivo) => {
            cambiaStato(chiusura.lead, "perso", motivo);
            setChiusura(null);
          }}
        />
      )}
    </main>
  );
}

// -------------------- pipeline --------------------

function Pipeline({
  leads,
  selezionato,
  onApri,
  onSposta,
}: {
  leads: Lead[];
  selezionato: string | null;
  onApri: (id: string) => void;
  onSposta: (lead: Lead, stato: Stato) => void;
}) {
  const [sopra, setSopra] = useState<Stato | null>(null);

  const lascia = (stato: Stato, e: DragEvent) => {
    e.preventDefault();
    setSopra(null);
    const id = e.dataTransfer.getData("text/plain");
    const lead = leads.find((l) => l.id === id);
    if (lead && lead.stato !== stato) onSposta(lead, stato);
  };

  return (
    <div className="mt-5 grid gap-3 overflow-x-auto pb-2 md:grid-cols-3 xl:grid-cols-5">
      {STATI.map((s) => {
        const colonna = leads.filter((l) => l.stato === s.value);
        return (
          <section
            key={s.value}
            onDragOver={(e) => {
              e.preventDefault();
              setSopra(s.value);
            }}
            onDragLeave={() => setSopra((cur) => (cur === s.value ? null : cur))}
            onDrop={(e) => lascia(s.value, e)}
            className={`flex min-h-[200px] flex-col rounded-2xl border p-3 transition-colors ${
              sopra === s.value ? "border-brand bg-info-bg/50" : "border-hairline bg-white/60"
            }`}
          >
            <header className="flex items-center justify-between px-1 pb-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                {s.label}
              </span>
              <span className="text-sm font-semibold text-ink-soft">{colonna.length}</span>
            </header>

            <div className="flex-1 space-y-2">
              {colonna.map((l) => (
                <CartaLead
                  key={l.id}
                  lead={l}
                  attivo={l.id === selezionato}
                  onClick={() => onApri(l.id)}
                />
              ))}
              {colonna.length === 0 && (
                <p className="rounded-xl border border-dashed border-hairline px-3 py-6 text-center text-xs text-ink-soft">
                  Trascina qui
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CartaLead({
  lead,
  attivo,
  onClick,
}: {
  lead: Lead;
  attivo: boolean;
  onClick: () => void;
}) {
  const p = priorita(lead);

  return (
    <article
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", lead.id)}
      onClick={onClick}
      className={`cursor-grab rounded-xl border bg-white p-3 transition-all active:cursor-grabbing ${
        attivo
          ? "border-brand shadow-[0_8px_24px_-14px_rgba(107,33,255,0.55)]"
          : "border-hairline hover:border-brand/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold text-ink">{lead.azienda}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${p.chip}`}>
          {p.label}
        </span>
      </div>
      <p className="mt-0.5 truncate text-xs text-ink-soft">{lead.nome}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <EtichettaFollowup lead={lead} />
        <span className="shrink-0 text-[11px] text-ink-soft">{daQuanto(lead.created_at)}</span>
      </div>
    </article>
  );
}

/** Pannello laterale: sopra il contenuto su mobile, colonna a destra su desktop. */
function Pannello({ children, onChiudi }: { children: ReactNode; onChiudi: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <button
        aria-label="Chiudi"
        onClick={onChiudi}
        className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]"
      />
      <div className="relative h-full w-full max-w-xl overflow-y-auto bg-surface shadow-2xl">
        <button
          onClick={onChiudi}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-white text-ink-soft hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// -------------------- motivo di perdita --------------------

function ModaleMotivo({
  lead,
  onAnnulla,
  onConferma,
}: {
  lead: Lead;
  onAnnulla: () => void;
  onConferma: (motivo: string) => void;
}) {
  const [scelto, setScelto] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center">
      <button aria-label="Annulla" onClick={onAnnulla} className="absolute inset-0 bg-ink/30" />
      <div className="relative w-full max-w-md rounded-2xl border border-hairline bg-white p-6">
        <h2 className="text-xl text-ink">Perché l'hai perso?</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {lead.azienda} — serve per capire dove si inceppa, non per l'archivio.
        </p>

        <div className="mt-5 space-y-2">
          {MOTIVI_PERDITA.map((m) => (
            <button
              key={m}
              onClick={() => setScelto(m)}
              className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                scelto === m
                  ? "border-brand bg-brand/5 text-ink"
                  : "border-hairline text-ink-soft hover:border-brand/50 hover:text-ink"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onAnnulla}
            className="rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            Annulla
          </button>
          <button
            onClick={() => scelto && onConferma(scelto)}
            disabled={!scelto}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:bg-hairline disabled:text-ink-soft"
          >
            Segna come perso
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- pezzi --------------------

function Numero({
  icona,
  valore,
  etichetta,
  nota,
  evidenzia,
}: {
  icona: ReactNode;
  valore: ReactNode;
  etichetta: string;
  nota?: string;
  evidenzia?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 ${
        evidenzia ? "border-brand/40 bg-info-bg/40" : "border-hairline"
      }`}
    >
      <div className={`flex items-center gap-2 ${evidenzia ? "text-brand" : "text-ink-soft"}`}>
        {icona}
        <span className="text-xs font-semibold uppercase tracking-widest">{etichetta}</span>
      </div>
      <p className="display mt-3 text-4xl text-ink">{valore}</p>
      {nota && <p className="mt-1 text-xs text-ink-soft">{nota}</p>}
    </div>
  );
}

function Chip({
  attivo,
  onClick,
  children,
}: {
  attivo: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        attivo
          ? "border-brand bg-brand text-white"
          : "border-hairline bg-white text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function BottoneVista({
  attivo,
  onClick,
  children,
}: {
  attivo: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        attivo ? "bg-brand text-white" : "text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

const STILE_FOLLOWUP: Record<Exclude<Followup, "nessuno">, { chip: string; testo: string }> = {
  ritardo: { chip: "bg-danger/10 text-danger", testo: "In ritardo" },
  oggi: { chip: "bg-amber-50 text-amber-700", testo: "Oggi" },
  futuro: { chip: "bg-hairline text-ink-soft", testo: "" },
};

function EtichettaFollowup({ lead }: { lead: Lead }) {
  const stato = followup(lead);
  if (stato === "nessuno" || !lead.prossimo_contatto) return <span />;
  const stile = STILE_FOLLOWUP[stato];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${stile.chip}`}
    >
      <Clock className="h-3 w-3" />
      {stile.testo || dataBreve(lead.prossimo_contatto)}
    </span>
  );
}

function Vuoto({ totale }: { totale: number }) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline bg-white p-8 text-center">
      <Inbox className="mx-auto h-6 w-6 text-ink-soft" />
      <p className="mt-3 text-sm text-ink-soft">
        {totale === 0
          ? "Nessun lead ancora. Appena qualcuno compila il check-up, compare qui."
          : "Nessun lead con questi filtri."}
      </p>
    </div>
  );
}

function RigaLead({ lead, attivo, onClick }: { lead: Lead; attivo: boolean; onClick: () => void }) {
  const p = priorita(lead);
  const s = statoInfo(lead.stato);

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border bg-white p-4 text-left transition-all ${
        attivo
          ? "border-brand shadow-[0_8px_24px_-14px_rgba(107,33,255,0.55)]"
          : "border-hairline hover:border-brand/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{lead.nome}</p>
          <p className="truncate text-sm text-ink-soft">{lead.azienda}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${p.chip}`}>
          {p.label}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 font-semibold text-ink-soft">
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          {s.label}
        </span>
        <div className="flex items-center gap-2">
          <EtichettaFollowup lead={lead} />
          <span className="text-ink-soft">{daQuanto(lead.created_at)}</span>
        </div>
      </div>
    </button>
  );
}

function Dettaglio({
  lead,
  attivita,
  onChiudi,
  onStato,
  onAggiorna,
  onFatto,
}: {
  lead: Lead;
  attivita: Attivita[];
  onChiudi: () => void;
  onStato: (stato: Stato) => void;
  onAggiorna: (patch: Partial<Lead>) => void;
  onFatto: () => void;
}) {
  // Lo stato della nota si azzera da solo cambiando lead: il chiamante passa
  // key={lead.id}, quindi React rimonta il componente invece di risincronizzarlo.
  const [nota, setNota] = useState(lead.note ?? "");
  const [salvata, setSalvata] = useState(false);

  const p = priorita(lead);
  const tel = telPulito(lead.telefono);
  const ritardo = followup(lead) === "ritardo";

  const salvaNota = () => {
    onAggiorna({ note: nota.trim() || null });
    setSalvata(true);
  };

  return (
    <div className="rounded-2xl border border-hairline bg-white">
      {/* Testata */}
      <div className="border-b border-hairline p-6">
        <button
          onClick={onChiudi}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla lista
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl text-ink">{lead.nome}</h2>
            <p className="mt-1 flex items-center gap-2 text-ink-soft">
              <Building2 className="h-4 w-4 shrink-0" />
              {lead.azienda} · {lead.ruolo}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.chip}`}>
            Priorità {p.label.toLowerCase()}
          </span>
        </div>

        <p className="mt-3 text-xs text-ink-soft">Arrivato il {dataEstesa(lead.created_at)}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={`tel:${tel}`}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <Phone className="h-4 w-4" />
            {lead.telefono}
          </a>
          <a
            href={`https://wa.me/${tel.replace("+", "")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
        </div>

        {!eChiuso(lead.stato) && (
          <button
            onClick={onFatto}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-info-bg"
          >
            <Check className="h-4 w-4" />
            Registra quello che hai fatto
          </button>
        )}
      </div>

      {/* Stato della trattativa */}
      <div className="border-b border-hairline bg-surface/60 p-6">
        <Titolino>A che punto sei</Titolino>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATI.map((s) => (
            <button
              key={s.value}
              onClick={() => onStato(s.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                lead.stato === s.value
                  ? "border-brand bg-brand text-white"
                  : "border-hairline bg-white text-ink-soft hover:text-ink"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${lead.stato === s.value ? "bg-white" : s.dot}`}
              />
              {s.label}
            </button>
          ))}
        </div>

        {lead.motivo_perdita && (
          <p className="mt-3 text-sm text-ink-soft">
            Motivo della perdita: <strong className="text-ink">{lead.motivo_perdita}</strong>
          </p>
        )}

        {/* Prossimo passo: solo se la trattativa è ancora in gioco */}
        {!eChiuso(lead.stato) && (
          <div className="mt-5">
            <Titolino>Prossimo passo</Titolino>

            {/* La data da sola è un promemoria muto: qui si scrive cosa devi fare. */}
            <input
              value={lead.prossima_azione ?? ""}
              onChange={(e) => onAggiorna({ prossima_azione: e.target.value || null })}
              placeholder="Cosa devi fare — es. richiamare per fissare la call"
              className="mt-2 w-full rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
            />

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={lead.prossimo_contatto ?? ""}
                onChange={(e) => onAggiorna({ prossimo_contatto: e.target.value || null })}
                className={`rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand ${
                  ritardo ? "border-danger text-danger" : "border-hairline"
                }`}
              />
              {!lead.prossimo_contatto && (
                <button
                  onClick={() => onAggiorna({ prossimo_contatto: oggiISO() })}
                  className="text-sm font-semibold text-brand underline underline-offset-4"
                >
                  Oggi
                </button>
              )}
              {lead.prossimo_contatto && (
                <button
                  onClick={() => onAggiorna({ prossimo_contatto: null })}
                  className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
                >
                  Togli
                </button>
              )}
              {ritardo && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-danger">
                  <AlertCircle className="h-4 w-4" />
                  Era da richiamare
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-1 text-xs text-ink-soft">
          {lead.contattato_at && <p>Primo contatto: {dataEstesa(lead.contattato_at)}</p>}
          {lead.chiuso_at && <p>Chiuso il: {dataEstesa(lead.chiuso_at)}</p>}
        </div>
      </div>

      {/* Note */}
      <div className="border-b border-hairline p-6">
        <Titolino>Note tue</Titolino>
        <textarea
          value={nota}
          onChange={(e) => {
            setNota(e.target.value);
            setSalvata(false);
          }}
          rows={3}
          placeholder="Cosa vi siete detti, quando richiamare…"
          className="mt-3 w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={salvaNota}
            disabled={nota === (lead.note ?? "")}
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:bg-hairline disabled:text-ink-soft"
          >
            Salva nota
          </button>
          {salvata && (
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
              <Check className="h-4 w-4" /> Salvata
            </span>
          )}
        </div>
      </div>

      {/* Storico: cos'è successo su questa trattativa, dal più recente */}
      <div className="border-b border-hairline p-6">
        <Titolino>Storico</Titolino>
        {attivita.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            Ancora niente. Ogni azione che registri finisce qui, in ordine di tempo.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {attivita.map((a) => {
              const t = tipoInfo(a.tipo);
              return (
                <li key={a.id} className="flex flex-wrap items-baseline gap-2 text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${t.chip}`}>
                    {t.label}
                  </span>
                  <span className="text-xs text-ink-soft">{dataEstesa(a.fatta_at)}</span>
                  {a.descrizione && <span className="text-ink">{a.descrizione}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Risposte */}
      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <Blocco titolo="Contatti">
          <Voce etichetta="Email" valore={lead.email} />
          <Voce etichetta="Telefono" valore={lead.telefono} />
        </Blocco>

        <Blocco titolo="Azienda">
          <Voce etichetta="Settore" valore={lead.settore} />
          <Voce etichetta="Dipendenti" valore={lead.dipendenti} />
          <Voce etichetta="Momento" valore={lead.momento_azienda} />
          <Voce etichetta="Assunzioni previste (12 mesi)" valore={lead.assumere_12m} />
        </Blocco>

        <Blocco titolo="La ricerca">
          <Voce etichetta="Ruolo aperto" valore={lead.ruolo_aperto} />
          <Voce etichetta="Quale ruolo" valore={lead.ruolo_quale} />
          <Voce etichetta="Urgenza" valore={lead.urgenza} />
          <Voce etichetta="Scoperto da" valore={lead.tempo_scoperto} />
          <Voce etichetta="Prima volta" valore={lead.prima_volta} />
          <Voce etichetta="Chi se ne occupa" valore={lead.chi_se_ne_occupa} />
        </Blocco>

        <Blocco titolo="Cosa gli pesa">
          <Voce
            etichetta="Frustrazione principale"
            valore={lead.frustrazioni?.length ? lead.frustrazioni.join(", ") : null}
          />
          <Voce etichetta="Vuole capire" valore={lead.obiettivo_call} />
          <Voce etichetta="Provenienza" valore={lead.source} />
          <Voce etichetta="Campagna" valore={campagna(lead.utm)} />
        </Blocco>
      </div>
    </div>
  );
}

function Titolino({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
      {children}
    </span>
  );
}

function Blocco({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <div>
      <Titolino>{titolo}</Titolino>
      <dl className="mt-3 space-y-2.5">{children}</dl>
    </div>
  );
}

function Voce({ etichetta, valore }: { etichetta: string; valore: string | null }) {
  if (!valore) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-sm text-ink-soft">{etichetta}</dt>
      <dd className="text-sm font-medium text-ink sm:text-right">{valore}</dd>
    </div>
  );
}
