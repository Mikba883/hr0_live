import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarClock,
  Check,
  Download,
  Flame,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  campagna,
  cercaLead,
  daQuanto,
  dataEstesa,
  ordinaLead,
  priorita,
  riepilogo,
  scaricaCsv,
  STATI,
  statoInfo,
  telPulito,
  type Lead,
  type Ordine,
  type Stato,
} from "@/lib/leads";

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

function Dashboard({ email }: { email: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Stato | "tutti">("tutti");
  const [ordine, setOrdine] = useState<Ordine>("recenti");
  const [selezionato, setSelezionato] = useState<string | null>(null);

  const carica = useCallback(async () => {
    setCaricamento(true);
    const { data, error } = await supabase
      .from("survey_responses")
      .select("*")
      .order("created_at", { ascending: false });
    setCaricamento(false);
    if (error) {
      console.error(error);
      setErrore("Non riesco a caricare i lead.");
      return;
    }
    setErrore(null);
    setLeads((data ?? []) as Lead[]);
  }, []);

  useEffect(() => {
    void carica();
  }, [carica]);

  const aggiorna = async (id: string, patch: Partial<Lead>) => {
    const precedenti = leads;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    const { error } = await supabase.from("survey_responses").update(patch).eq("id", id);
    if (error) {
      console.error(error);
      setLeads(precedenti);
      setErrore("Modifica non salvata. Riprova.");
    }
  };

  const numeri = useMemo(() => riepilogo(leads), [leads]);

  const visibili = useMemo(() => {
    const filtrati = leads.filter(
      (l) => (filtro === "tutti" || l.stato === filtro) && cercaLead(l, q),
    );
    return ordinaLead(filtrati, ordine);
  }, [leads, filtro, q, ordine]);

  const lead = leads.find((l) => l.id === selezionato) ?? null;

  return (
    <main className="min-h-screen bg-surface">
      <header className="sticky top-0 z-20 border-b border-hairline bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
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
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {/* La fotografia d'insieme */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Numero
            icona={<Inbox className="h-4 w-4" />}
            valore={numeri.totale}
            etichetta="Lead totali"
          />
          <Numero
            icona={<Users className="h-4 w-4" />}
            valore={numeri.daContattare}
            etichetta="Da contattare"
            evidenzia={numeri.daContattare > 0}
          />
          <Numero
            icona={<CalendarClock className="h-4 w-4" />}
            valore={numeri.settimana}
            etichetta="Ultimi 7 giorni"
          />
          <Numero
            icona={<Flame className="h-4 w-4" />}
            valore={numeri.caldi}
            etichetta="Priorità alta"
          />
        </div>

        {/* Filtri */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca per nome, azienda, email, telefono…"
              className="w-full rounded-full border border-hairline bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-brand"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={ordine}
              onChange={(e) => setOrdine(e.target.value as Ordine)}
              className="rounded-full border border-hairline bg-white px-4 py-3 text-sm font-semibold text-ink outline-none focus:border-brand"
            >
              <option value="recenti">Più recenti</option>
              <option value="priorita">Priorità</option>
            </select>
            <button
              onClick={() => scaricaCsv(visibili)}
              disabled={visibili.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:text-ink-soft"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <Chip attivo={filtro === "tutti"} onClick={() => setFiltro("tutti")}>
            Tutti ({leads.length})
          </Chip>
          {STATI.map((s) => {
            const n = leads.filter((l) => l.stato === s.value).length;
            return (
              <Chip key={s.value} attivo={filtro === s.value} onClick={() => setFiltro(s.value)}>
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                {s.label} ({n})
              </Chip>
            );
          })}
        </div>

        {errore && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errore}
          </div>
        )}

        {/* Lista + dettaglio */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
          <div className={`space-y-2 ${lead ? "hidden lg:block" : ""}`}>
            {caricamento && leads.length === 0 && (
              <p className="rounded-2xl border border-hairline bg-white p-6 text-sm text-ink-soft">
                Carico i lead…
              </p>
            )}
            {!caricamento && visibili.length === 0 && (
              <div className="rounded-2xl border border-dashed border-hairline bg-white p-8 text-center">
                <Inbox className="mx-auto h-6 w-6 text-ink-soft" />
                <p className="mt-3 text-sm text-ink-soft">
                  {leads.length === 0
                    ? "Nessun lead ancora. Appena qualcuno compila il check-up, compare qui."
                    : "Nessun lead con questi filtri."}
                </p>
              </div>
            )}
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
            {lead ? (
              <Dettaglio
                key={lead.id}
                lead={lead}
                onChiudi={() => setSelezionato(null)}
                onAggiorna={(patch) => aggiorna(lead.id, patch)}
              />
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-hairline bg-white p-8 text-center">
                <p className="max-w-xs text-sm text-ink-soft">
                  Scegli un lead dalla lista per vedere tutte le risposte e richiamarlo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// -------------------- pezzi --------------------

function Numero({
  icona,
  valore,
  etichetta,
  evidenzia,
}: {
  icona: ReactNode;
  valore: number;
  etichetta: string;
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
        <span className="text-ink-soft">{daQuanto(lead.created_at)}</span>
      </div>
    </button>
  );
}

function Dettaglio({
  lead,
  onChiudi,
  onAggiorna,
}: {
  lead: Lead;
  onChiudi: () => void;
  onAggiorna: (patch: Partial<Lead>) => void;
}) {
  // Lo stato della nota si azzera da solo cambiando lead: il chiamante passa
  // key={lead.id}, quindi React rimonta il componente invece di risincronizzarlo.
  const [nota, setNota] = useState(lead.note ?? "");
  const [salvata, setSalvata] = useState(false);

  const p = priorita(lead);
  const tel = telPulito(lead.telefono);

  const cambiaStato = (stato: Stato) => {
    // Segnare "contattato" senza registrare quando lo hai fatto renderebbe
    // inutile il campo: lo compiliamo la prima volta che esci da "nuovo".
    const patch: Partial<Lead> = { stato };
    if (stato !== "nuovo" && !lead.contattato_at) patch.contattato_at = new Date().toISOString();
    onAggiorna(patch);
  };

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

        {/* Azioni */}
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
      </div>

      {/* Stato */}
      <div className="border-b border-hairline p-6">
        <Titolino>A che punto sei</Titolino>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATI.map((s) => (
            <button
              key={s.value}
              onClick={() => cambiaStato(s.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                lead.stato === s.value
                  ? "border-brand bg-brand text-white"
                  : "border-hairline text-ink-soft hover:text-ink"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${lead.stato === s.value ? "bg-white" : s.dot}`}
              />
              {s.label}
            </button>
          ))}
        </div>
        {lead.contattato_at && (
          <p className="mt-3 text-xs text-ink-soft">
            Primo contatto: {dataEstesa(lead.contattato_at)}
          </p>
        )}
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
