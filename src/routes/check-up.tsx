import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/check-up")({
  head: () => ({
    meta: [
      { title: "Check-up Assunzioni gratuito — Rispondi in 2 minuti" },
      {
        name: "description",
        content:
          "Rispondi a poche domande: arriviamo alla call già preparati e ne esci con una lettura onesta di dove stai perdendo tempo e soldi nelle assunzioni.",
      },
      { name: "robots", content: "noindex,follow" },
      { property: "og:title", content: "Check-up Assunzioni gratuito" },
      {
        property: "og:description",
        content: "Rispondi in 2 minuti e prenoto la tua call diagnostica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckUpPage,
});

// -------------------- tipi & opzioni --------------------

type Frustrazione =
  | "Tempi lunghi"
  | "Pochi candidati validi"
  | "Persone che se ne vanno presto"
  | "Costi delle agenzie"
  | "Il tempo che mi porta via"
  | "Nessuna esperienza particolare";

type State = {
  // Blocco 1
  nome: string;
  azienda: string;
  ruolo: string;
  email: string;
  telefono: string;
  // Blocco 2
  dipendenti: string;
  settore: string;
  assumere_12m: string;
  momento_azienda: string;
  // Blocco 3
  ruolo_aperto: string;
  ruolo_quale: string;
  urgenza: string;
  tempo_scoperto: string;
  prima_volta: string;
  chi_se_ne_occupa: string;
  frustrazioni: Frustrazione[];
  // Chiusura
  obiettivo_call: string;
  orario_preferito: string;
  // Privacy
  consenso: boolean;
};

const initial: State = {
  nome: "",
  azienda: "",
  ruolo: "",
  email: "",
  telefono: "",
  dipendenti: "",
  settore: "",
  assumere_12m: "",
  momento_azienda: "",
  ruolo_aperto: "",
  ruolo_quale: "",
  urgenza: "",
  tempo_scoperto: "",
  prima_volta: "",
  chi_se_ne_occupa: "",
  frustrazioni: [],
  obiettivo_call: "",
  orario_preferito: "",
  consenso: false,
};

const RUOLI = ["Titolare", "Direzione", "Responsabile HR", "Office manager", "Altro"];
const DIPENDENTI = ["1-10", "11-50", "51-100", "Oltre 100"];
const ASSUMERE = ["No", "Sì, 1 persona", "Sì, 2-3 persone", "Sì, più di 3"];
const MOMENTO = ["Crescendo velocemente", "Crescendo con calma", "Stabile", "Riorganizzandosi"];
const RUOLO_APERTO = ["Sì, uno", "Sì, più di uno", "No, ragiono sul medio periodo"];
const URGENZA = ["Serviva ieri", "Entro 1 mese", "Entro 3 mesi", "Nessuna fretta"];
const TEMPO_SCOPERTO = ["Meno di 1 mese", "1-3 mesi", "Oltre 3 mesi"];
const PRIMA_VOLTA = [
  "Sì, prima volta",
  "No, l'abbiamo già cercata in passato",
  "No, stiamo sostituendo una persona che è uscita",
];
const CHI_SE_NE_OCCUPA = [
  "Io titolare",
  "Un ufficio non dedicato",
  "Una persona interna HR",
  "Un'agenzia esterna",
  "Nessuno in modo strutturato",
];
const FRUSTRAZIONI: Frustrazione[] = [
  "Tempi lunghi",
  "Pochi candidati validi",
  "Persone che se ne vanno presto",
  "Costi delle agenzie",
  "Il tempo che mi porta via",
  "Nessuna esperienza particolare",
];
const ORARIO = ["Mattina", "Pausa pranzo", "Pomeriggio", "Indifferente"];

// -------------------- validators --------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+?39[\s-]?)?[0-9\s-]{6,}$/;

// -------------------- page --------------------

function CheckUpPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<State>(initial);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utm, setUtm] = useState<Record<string, string>>({});
  const [source, setSource] = useState<string>("");

  // Utm + source dalla pagina precedente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const collected: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => {
      const v = params.get(k);
      if (v) collected[k] = v;
    });
    setUtm(collected);
    setSource(params.get("src") || document.referrer || "");
  }, []);

  const set = <K extends keyof State>(k: K, v: State[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  // Step 3: 3.2-3.5 solo se ruolo_aperto positivo
  const showDettagliRuolo =
    state.ruolo_aperto === "Sì, uno" || state.ruolo_aperto === "Sì, più di uno";

  // Validazione per step (blocca "Avanti")
  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return (
          state.nome.trim().length > 1 &&
          state.azienda.trim().length > 1 &&
          state.ruolo &&
          EMAIL_RE.test(state.email) &&
          PHONE_RE.test(state.telefono.trim())
        );
      case 1:
        return (
          state.dipendenti &&
          state.settore.trim().length > 1 &&
          state.assumere_12m &&
          state.momento_azienda
        );
      case 2:
        if (!state.ruolo_aperto) return false;
        if (!state.chi_se_ne_occupa) return false;
        if (state.frustrazioni.length === 0) return false;
        if (showDettagliRuolo) {
          return (
            state.ruolo_quale.trim().length > 0 &&
            !!state.urgenza &&
            !!state.tempo_scoperto &&
            !!state.prima_volta
          );
        }
        return true;
      case 3:
        return state.consenso;
      default:
        return true;
    }
  }, [state, step, showDettagliRuolo]);

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const next = () => {
    if (!stepValid) return;
    setError(null);
    setStep((s) => Math.min(totalSteps - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!stepValid) return;
    setSubmitting(true);
    setError(null);
    const payload = {
      nome: state.nome.trim(),
      azienda: state.azienda.trim(),
      ruolo: state.ruolo,
      email: state.email.trim(),
      telefono: state.telefono.trim(),
      dipendenti: state.dipendenti,
      settore: state.settore.trim(),
      assumere_12m: state.assumere_12m,
      momento_azienda: state.momento_azienda,
      ruolo_aperto: state.ruolo_aperto,
      ruolo_quale: showDettagliRuolo ? state.ruolo_quale.trim() : null,
      urgenza: showDettagliRuolo ? state.urgenza : null,
      tempo_scoperto: showDettagliRuolo ? state.tempo_scoperto : null,
      prima_volta: showDettagliRuolo ? state.prima_volta : null,
      chi_se_ne_occupa: state.chi_se_ne_occupa,
      frustrazioni: state.frustrazioni,
      obiettivo_call: state.obiettivo_call.trim() || null,
      orario_preferito: state.orario_preferito || null,
      consenso_privacy: state.consenso,
      source: source || null,
      utm: Object.keys(utm).length ? utm : null,
    };

    const { error: e } = await supabase.from("survey_responses").insert(payload);
    setSubmitting(false);
    if (e) {
      console.error(e);
      setError(
        "Non sono riuscito a salvare le tue risposte. Controlla la connessione e riprova.",
      );
      return;
    }
    navigate({ to: "/grazie", search: { tel: state.telefono.trim() } as never });
  };

  return (
    <main className="min-h-screen bg-surface">
      {/* Top bar */}
      <div className="border-b border-hairline bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
            Check-up Assunzioni
          </span>
          <span className="text-xs font-semibold text-ink-soft">
            Passo {step + 1} di {totalSteps}
          </span>
        </div>
        <div className="h-1 w-full bg-hairline">
          <div
            className="h-full bg-brand transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
        {step === 0 && (
          <StepIntro
            title="Chi sei"
            subtitle="Check-up Assunzioni gratuito. Rispondi a poche domande: arriviamo alla call già preparati e ne esci con una lettura onesta di dove stai perdendo tempo e soldi nelle assunzioni."
          >
            <TextField
              label="Nome e cognome"
              value={state.nome}
              onChange={(v) => set("nome", v)}
              autoComplete="name"
              autoFocus
            />
            <TextField
              label="Azienda"
              value={state.azienda}
              onChange={(v) => set("azienda", v)}
              autoComplete="organization"
            />
            <PillGroup
              label="Il tuo ruolo in azienda"
              options={RUOLI}
              value={state.ruolo}
              onChange={(v) => set("ruolo", v)}
            />
            <TextField
              label="Email aziendale"
              type="email"
              value={state.email}
              onChange={(v) => set("email", v)}
              autoComplete="email"
              error={
                state.email.length > 0 && !EMAIL_RE.test(state.email)
                  ? "Controlla l'email, il formato non sembra corretto."
                  : undefined
              }
            />
            <TextField
              label="Telefono"
              type="tel"
              value={state.telefono}
              onChange={(v) => set("telefono", v)}
              autoComplete="tel"
              hint="Ti contatto a questo numero per fissare l'appuntamento."
              error={
                state.telefono.length > 0 && !PHONE_RE.test(state.telefono.trim())
                  ? "Controlla il numero di telefono, sembra incompleto."
                  : undefined
              }
            />
          </StepIntro>
        )}

        {step === 1 && (
          <StepIntro title="La tua azienda">
            <PillGroup
              label="Numero di dipendenti"
              options={DIPENDENTI}
              value={state.dipendenti}
              onChange={(v) => set("dipendenti", v)}
            />
            <TextField
              label="Settore"
              value={state.settore}
              onChange={(v) => set("settore", v)}
              placeholder="Es. metalmeccanico, servizi, retail…"
            />
            <PillGroup
              label="Pensate di assumere nei prossimi 12 mesi?"
              options={ASSUMERE}
              value={state.assumere_12m}
              onChange={(v) => set("assumere_12m", v)}
            />
            <PillGroup
              label="L'azienda in questo momento sta..."
              options={MOMENTO}
              value={state.momento_azienda}
              onChange={(v) => set("momento_azienda", v)}
            />
          </StepIntro>
        )}

        {step === 2 && (
          <StepIntro title="La ricerca che hai in corso">
            <PillGroup
              label="C'è un ruolo aperto adesso che ti preme coprire?"
              options={RUOLO_APERTO}
              value={state.ruolo_aperto}
              onChange={(v) => {
                set("ruolo_aperto", v);
                if (v === "No, ragiono sul medio periodo") {
                  setState((s) => ({
                    ...s,
                    ruolo_aperto: v,
                    ruolo_quale: "",
                    urgenza: "",
                    tempo_scoperto: "",
                    prima_volta: "",
                  }));
                }
              }}
            />

            {showDettagliRuolo && (
              <>
                <TextField
                  label="Quale ruolo?"
                  value={state.ruolo_quale}
                  onChange={(v) => set("ruolo_quale", v)}
                  placeholder="Es. commerciale estero, responsabile produzione…"
                />
                <PillGroup
                  label="Quanto è urgente questa assunzione?"
                  options={URGENZA}
                  value={state.urgenza}
                  onChange={(v) => set("urgenza", v)}
                />
                <PillGroup
                  label="Da quanto tempo il ruolo è scoperto?"
                  options={TEMPO_SCOPERTO}
                  value={state.tempo_scoperto}
                  onChange={(v) => set("tempo_scoperto", v)}
                />
                <PillGroup
                  label="È la prima volta che cercate una figura come questa?"
                  options={PRIMA_VOLTA}
                  value={state.prima_volta}
                  onChange={(v) => set("prima_volta", v)}
                />
              </>
            )}

            <PillGroup
              label="Oggi, di assunzioni e selezione chi se ne occupa?"
              options={CHI_SE_NE_OCCUPA}
              value={state.chi_se_ne_occupa}
              onChange={(v) => set("chi_se_ne_occupa", v)}
            />
            <PillGroup
              label="Cosa vi ha frustrato di più nelle assunzioni fatte finora?"
              options={FRUSTRAZIONI}
              value={state.frustrazioni}
              onChange={(v) => set("frustrazioni", v as Frustrazione[])}
              multi
              hint="Puoi selezionarne più di una."
            />
          </StepIntro>
        )}

        {step === 3 && (
          <StepIntro title="Ultima cosa">
            <div>
              <label className="mb-2 block text-base font-semibold text-ink">
                C'è qualcosa di specifico che vorresti capire durante il check-up?
              </label>
              <textarea
                value={state.obiettivo_call}
                onChange={(e) => set("obiettivo_call", e.target.value)}
                rows={4}
                placeholder="Scrivi qui, anche due righe"
                className="w-full rounded-lg border border-hairline bg-white px-4 py-3 text-base outline-none transition-colors focus:border-brand"
              />
            </div>
            <PillGroup
              label="Quando preferisci essere ricontattato?"
              options={ORARIO}
              value={state.orario_preferito}
              onChange={(v) => set("orario_preferito", v)}
              optional
            />

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-hairline bg-white p-4">
              <input
                type="checkbox"
                checked={state.consenso}
                onChange={(e) => set("consenso", e.target.checked)}
                className="mt-1 h-5 w-5 accent-brand"
              />
              <span className="text-sm text-ink-soft">
                Ho letto l'
                <a href="/privacy" className="text-brand underline" target="_blank" rel="noreferrer">
                  informativa privacy
                </a>{" "}
                e acconsento al trattamento dei miei dati per essere ricontattato.
              </span>
            </label>

            {error && (
              <div className="rounded-md border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
                {error}
              </div>
            )}
          </StepIntro>
        )}

        {/* Nav */}
        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={prev}
              className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              ← Indietro
            </button>
          ) : (
            <span />
          )}

          {step < totalSteps - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={!stepValid}
              className="inline-flex w-full items-center justify-center rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(107,33,255,0.55)] transition-all hover:bg-brand-dark hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-hairline disabled:text-ink-soft disabled:shadow-none disabled:hover:translate-y-0 sm:w-auto"
            >
              Continua →
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!stepValid || submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(107,33,255,0.55)] transition-all hover:bg-brand-dark hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-hairline disabled:text-ink-soft disabled:shadow-none disabled:hover:translate-y-0 sm:w-auto"
            >
              {submitting ? "Invio in corso…" : "Prenota il check-up gratuito"}
            </button>
          )}
        </div>

        {/* Trust */}
        <p className="mt-8 text-center text-xs text-ink-soft">
          Nessuna newsletter, nessuno spam. Ti contatto solo per fissare la call.
        </p>
      </div>
    </main>
  );
}

// -------------------- pieces --------------------

function StepIntro({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h1 className="text-3xl leading-tight text-ink sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-base text-ink-soft sm:text-lg">{subtitle}</p>}
      <div className="mt-8 space-y-6">{children}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  error,
  autoComplete,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-base font-semibold text-ink">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        inputMode={type === "tel" ? "tel" : type === "email" ? "email" : undefined}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-base outline-none transition-colors focus:border-brand ${
          error ? "border-danger" : "border-hairline"
        }`}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

type PillGroupProps = {
  label: string;
  options: string[];
  optional?: boolean;
  hint?: string;
} & (
  | { multi?: false; value: string; onChange: (v: string) => void }
  | { multi: true; value: string[]; onChange: (v: string[]) => void }
);

function PillGroup(props: PillGroupProps) {
  const { label, options, optional = false, hint } = props;

  const isSelected = (opt: string) =>
    props.multi ? props.value.includes(opt) : props.value === opt;

  const toggle = (opt: string) => {
    if (props.multi) {
      const arr = props.value;
      props.onChange(arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]);
    } else {
      props.onChange(opt);
    }
  };

  return (
    <div>
      <label className="mb-3 block text-base font-semibold text-ink">
        {label}
        {optional && <span className="ml-2 text-xs font-normal text-ink-soft">(facoltativo)</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = isSelected(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all sm:text-base ${
                selected
                  ? "border-brand bg-brand text-white shadow-[0_8px_20px_-10px_rgba(107,33,255,0.6)]"
                  : "border-hairline bg-white text-ink hover:border-brand hover:text-brand"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-2 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
