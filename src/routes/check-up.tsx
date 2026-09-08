import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { trackEvent } from "@/lib/analytics";
import { salvaCheckUp } from "@/lib/checkup";

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

// -------------------- state --------------------

type State = {
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
  ruolo_quale: string;
  urgenza: string;
  tempo_scoperto: string;
  prima_volta: string;
  chi_se_ne_occupa: string;
  frustrazione: string;
  obiettivo_call: string;
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
  frustrazione: "",
  obiettivo_call: "",
  consenso: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+?39[\s-]?)?[0-9\s-]{6,}$/;

// -------------------- questions definition --------------------

type BaseQ = {
  key: keyof State;
  intro?: string;
  label: string;
  hint?: string;
  show?: (s: State) => boolean;
  validate?: (s: State) => string | null;
};
type Question =
  | (BaseQ & { type: "text" | "email" | "tel"; placeholder?: string; autoComplete?: string })
  | (BaseQ & { type: "textarea"; placeholder?: string; optional?: true })
  | (BaseQ & { type: "choice"; options: string[]; optional?: true })
  | (BaseQ & { type: "consent" });

const questions: Question[] = [
  {
    key: "nome",
    type: "text",
    intro: "Iniziamo",
    label: "Come ti chiami?",
    placeholder: "Nome e cognome",
    autoComplete: "name",
    validate: (s) => (s.nome.trim().length > 1 ? null : "Scrivi almeno 2 caratteri."),
  },
  {
    key: "azienda",
    type: "text",
    label: "Come si chiama la tua azienda?",
    placeholder: "Es. Rossi S.r.l.",
    autoComplete: "organization",
    validate: (s) => (s.azienda.trim().length > 1 ? null : "Scrivi il nome dell'azienda."),
  },
  {
    key: "ruolo",
    type: "choice",
    label: "Qual è il tuo ruolo in azienda?",
    options: ["Titolare", "Direzione", "Responsabile HR", "Office manager", "Altro"],
  },
  {
    key: "email",
    type: "email",
    label: "Qual è la tua email aziendale?",
    placeholder: "nome@azienda.it",
    autoComplete: "email",
    validate: (s) => (EMAIL_RE.test(s.email) ? null : "Controlla l'email."),
  },
  {
    key: "telefono",
    type: "tel",
    label: "A che numero posso ricontattarti?",
    hint: "Ti chiamo solo per fissare l'appuntamento.",
    placeholder: "+39…",
    autoComplete: "tel",
    validate: (s) => (PHONE_RE.test(s.telefono.trim()) ? null : "Controlla il numero."),
  },
  {
    key: "dipendenti",
    type: "choice",
    intro: "La tua azienda",
    label: "Quanti siete in azienda?",
    options: ["1-10", "11-25", "26-50", "51-100", "Oltre 100"],
  },
  {
    key: "settore",
    type: "text",
    label: "In che settore lavorate?",
    placeholder: "Es. metalmeccanico, servizi, retail…",
    validate: (s) => (s.settore.trim().length > 1 ? null : "Scrivi il settore."),
  },
  {
    key: "assumere_12m",
    type: "choice",
    label: "Pensate di assumere nei prossimi 12 mesi?",
    options: ["No", "Sì, 1 persona", "Sì, 2-3 persone", "Sì, più di 3"],
  },
  {
    key: "momento_azienda",
    type: "choice",
    label: "L'azienda in questo momento sta…",
    options: ["Crescendo velocemente", "Crescendo con calma", "Stabile", "Riorganizzandosi"],
  },
  {
    key: "ruolo_aperto",
    type: "choice",
    intro: "La ricerca in corso",
    label: "C'è un ruolo aperto adesso che ti preme coprire?",
    options: ["Sì, uno", "Sì, più di uno", "No, ragiono sul medio periodo"],
  },
  {
    key: "ruolo_quale",
    type: "text",
    label: "Quale ruolo?",
    placeholder: "Es. commerciale estero, responsabile produzione…",
    show: (s) => s.ruolo_aperto === "Sì, uno" || s.ruolo_aperto === "Sì, più di uno",
    validate: (s) => (s.ruolo_quale.trim().length > 0 ? null : "Indica quale ruolo."),
  },
  {
    key: "urgenza",
    type: "choice",
    label: "Quanto è urgente questa assunzione?",
    options: ["Serviva ieri", "Entro 1 mese", "Entro 3 mesi", "Nessuna fretta"],
    show: (s) => s.ruolo_aperto === "Sì, uno" || s.ruolo_aperto === "Sì, più di uno",
  },
  {
    key: "tempo_scoperto",
    type: "choice",
    label: "Da quanto tempo il ruolo è scoperto?",
    options: ["Meno di 1 mese", "1-3 mesi", "Oltre 3 mesi"],
    show: (s) => s.ruolo_aperto === "Sì, uno" || s.ruolo_aperto === "Sì, più di uno",
  },
  {
    key: "prima_volta",
    type: "choice",
    label: "È la prima volta che cercate una figura come questa?",
    options: [
      "Sì, prima volta",
      "No, l'abbiamo già cercata in passato",
      "No, stiamo sostituendo una persona uscita",
    ],
    show: (s) => s.ruolo_aperto === "Sì, uno" || s.ruolo_aperto === "Sì, più di uno",
  },
  {
    key: "chi_se_ne_occupa",
    type: "choice",
    label: "Oggi, di assunzioni e selezione chi se ne occupa?",
    options: [
      "Io titolare",
      "Un ufficio non dedicato",
      "Una persona interna HR",
      "Un'agenzia esterna",
      "Nessuno in modo strutturato",
    ],
  },
  {
    key: "frustrazione",
    type: "choice",
    label: "Cosa ti ha frustrato di più nelle assunzioni fatte finora?",
    hint: "Scegli quella che pesa di più.",
    options: [
      "Tempi lunghi",
      "Pochi candidati validi",
      "Persone che se ne vanno presto",
      "Costi delle agenzie",
      "Il tempo che mi porta via",
      "Nessuna esperienza particolare",
    ],
  },
  {
    key: "obiettivo_call",
    type: "textarea",
    intro: "Ultime due cose",
    label: "C'è qualcosa di specifico che vorresti capire durante il check-up?",
    placeholder: "Scrivi qui, anche due righe. (facoltativo)",
    optional: true,
  },
  {
    key: "consenso",
    type: "consent",
    label: "Un ultimo passaggio",
  },
];

/**
 * Come si chiama questo modulo nei report.
 *
 * Sul sito ne esiste più d'uno, e `form_start` senza questo li sommerebbe in
 * un imbuto solo che non descrive nessuno dei due.
 */
const MODULO = "check-up";

// -------------------- page --------------------

function CheckUpPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<State>(initial);
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ messaggio: string; dettaglio: string } | null>(null);
  const [touched, setTouched] = useState(false);
  const [utm, setUtm] = useState<Record<string, string>>({});
  const [source, setSource] = useState<string>("");

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

  const visible = useMemo(() => questions.filter((q) => !q.show || q.show(state)), [state]);
  const total = visible.length;
  const safeIndex = Math.min(index, total - 1);
  const q = visible[safeIndex];
  const progress = ((safeIndex + 1) / total) * 100;

  /** Una sola `form_start` per compilazione, anche tornando indietro e avanti. */
  const iniziato = useRef(false);
  /** Quando è stato toccato il primo campo, per misurare quanto ci vuole. */
  const inizio = useRef(0);
  /** Il salvataggio è andato a buon fine: non è un abbandono. */
  const inviato = useRef(false);
  /** L'abbandono si segnala una volta sola, comunque sia uscito. */
  const abbandonato = useRef(false);

  /**
   * Segna l'inizio della compilazione, alla prima interazione con un campo.
   *
   * Non al primo "Continua" riuscito: chi scrive il nome, ci ripensa e se ne
   * va ha cominciato a compilare a tutti gli effetti, e non contarlo nasconde
   * proprio l'abbandono più precoce — quello che costa di più.
   */
  const segnalaInizio = () => {
    if (iniziato.current) return;
    iniziato.current = true;
    inizio.current = Date.now();
    trackEvent("form_start", { modulo: MODULO });
  };

  /** Secondi dall'inizio della compilazione. */
  const durata = () => (inizio.current ? Math.round((Date.now() - inizio.current) / 1000) : 0);

  /**
   * A che punto si era, letto al momento dell'uscita.
   *
   * L'effetto che segnala l'abbandono gira una volta sola, quindi la sua
   * chiusura vede il primo passo per sempre. Questo ref, aggiornato a ogni
   * render, è ciò che rende utile l'evento: senza, ogni abbandono risulterebbe
   * avvenuto alla domanda uno.
   */
  const dove = useRef<{ passo: number; domanda?: string; totale: number }>({
    passo: 1,
    totale: 0,
  });

  /**
   * Chi se ne va a metà, e da quale domanda.
   *
   * Su un modulo di diciotto schermate è il dato che manca per sapere dove si
   * rompe: l'ultimo `form_step` dice fin dove è arrivato, non che ha smesso.
   *
   * Ascolta `pagehide` e lo smontaggio, non il passaggio in secondo piano.
   * Chi apre la posta per copiarsi un indirizzo e torna a finire il modulo non
   * ha abbandonato niente, e contarlo falserebbe l'unica cosa che questo
   * evento deve dire. In cambio qualche chiusura da telefono sfugge.
   */
  useEffect(() => {
    const abbandona = () => {
      if (!iniziato.current || inviato.current || abbandonato.current) return;
      abbandonato.current = true;
      trackEvent("form_abandon", {
        modulo: MODULO,
        passo: dove.current.passo,
        totale: dove.current.totale,
        domanda: dove.current.domanda,
        secondi: durata(),
      });
    };

    window.addEventListener("pagehide", abbandona);
    return () => {
      window.removeEventListener("pagehide", abbandona);
      abbandona();
    };
  }, []);

  const set = <K extends keyof State>(k: K, v: State[K]) => {
    segnalaInizio();
    setState((s) => ({ ...s, [k]: v }));
  };

  const currentError = useMemo(() => {
    if (!q) return null;
    if (q.type === "consent") return state.consenso ? null : "Serve il consenso per procedere.";
    if (q.type === "textarea" && q.optional) return null;
    if (q.type === "choice" && q.optional) return null;
    if (q.type === "choice") return state[q.key] ? null : "Scegli un'opzione.";
    if (q.validate) return q.validate(state);
    return null;
  }, [q, state]);

  const goNext = () => {
    if (currentError) {
      setTouched(true);
      // Dove la gente sbatte contro la validazione: su un modulo di diciotto
      // domande è il punto in cui si perde chi se ne va.
      trackEvent("form_error", {
        modulo: MODULO,
        passo: safeIndex + 1,
        domanda: q?.key,
        errore: currentError,
      });
      return;
    }
    setTouched(false);
    setError(null);

    // `form_start` è già partito alla prima interazione con un campo, che è
    // prima di qui: si può arrivare a premere "Continua" solo dopo aver
    // risposto.
    trackEvent("form_step", {
      modulo: MODULO,
      passo: safeIndex + 1,
      totale: total,
      domanda: q?.key,
    });

    if (safeIndex >= total - 1) {
      void submit();
    } else {
      setIndex(safeIndex + 1);
    }
  };

  const goPrev = () => {
    setTouched(false);
    setError(null);
    if (safeIndex === 0) return;
    // Tornare indietro non è navigazione innocua su un modulo a una domanda
    // per schermata: vuol dire che una domanda è stata capita male, o che la
    // risposta data prima non convince più. Dove succede spesso, la domanda è
    // scritta male.
    trackEvent("form_back", { modulo: MODULO, passo: safeIndex + 1, domanda: q?.key });
    setIndex(safeIndex - 1);
  };

  // ChoiceList fa avanzare da solo dopo la scelta, ma con un `setTimeout`: se
  // gli passassimo `goNext` direttamente, il timer eseguirebbe la versione
  // creata *prima* del click, che vede la risposta ancora vuota e blocca
  // l'avanzamento con un "Scegli un'opzione." comparso dal nulla. Il ref fa sì
  // che al momento dello scatto venga chiamata la versione aggiornata.
  const goNextRef = useRef(goNext);
  useEffect(() => {
    goNextRef.current = goNext;
    dove.current = { passo: safeIndex + 1, domanda: q?.key as string | undefined, totale: total };
  });
  const avanti = useCallback(() => goNextRef.current(), []);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const openRole =
      state.ruolo_aperto === "Sì, uno" || state.ruolo_aperto === "Sì, più di uno";
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
      ruolo_quale: openRole ? state.ruolo_quale.trim() : null,
      urgenza: openRole ? state.urgenza : null,
      tempo_scoperto: openRole ? state.tempo_scoperto : null,
      prima_volta: openRole ? state.prima_volta : null,
      chi_se_ne_occupa: state.chi_se_ne_occupa,
      frustrazioni: state.frustrazione ? [state.frustrazione] : [],
      obiettivo_call: state.obiettivo_call.trim() || null,
      consenso_privacy: state.consenso,
      source: source || null,
      utm: Object.keys(utm).length ? utm : null,
    };
    const esito = await salvaCheckUp(payload);
    setSubmitting(false);
    if (!esito.ok) {
      console.error("Check-up non salvato:", esito.dettaglio);
      // Un invio fallito è un lead perso in silenzio: senza questo evento non
      // sapresti mai che è successo, perché chi lo subisce non te lo scrive.
      trackEvent("form_submit_error", { modulo: MODULO, dettaglio: esito.dettaglio });
      setError({ messaggio: esito.messaggio, dettaglio: esito.dettaglio });
      return;
    }
    // Prima di `navigate`: lo smontaggio della pagina segnalerebbe altrimenti
    // un abbandono proprio a chi ha appena completato il modulo.
    inviato.current = true;
    // Quanto ci vuole davvero a compilarlo. Su diciotto domande è la risposta
    // alla domanda se sia troppo lungo.
    trackEvent("form_submit", { modulo: MODULO, secondi: durata() });
    navigate({ to: "/grazie", search: { tel: state.telefono.trim() } as never });
  };

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      {/* Top bar */}
      <div className="border-b border-hairline bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
            Check-up Assunzioni
          </span>
          <span className="text-xs font-semibold text-ink-soft">
            {safeIndex + 1} / {total}
          </span>
        </div>
        <div
          className="h-2 w-full bg-hairline"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={safeIndex + 1}
          aria-label="Avanzamento del check-up"
        >
          <div
            className="h-full rounded-r-full bg-brand transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10 sm:py-16">
        {q && (
          <QuestionCard
            q={q}
            state={state}
            set={set}
            touched={touched}
            error={currentError}
            onEnter={avanti}
          />
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
            <p>{error.messaggio}</p>
            <p className="mt-2 font-mono text-xs text-danger/70">{error.dettaglio}</p>
          </div>
        )}

        {/*
          Nav. `data-track="manual"`: il percorso dentro il modulo lo
          raccontano `form_step`, `form_back` e `form_error`, che dicono a che
          domanda si era. Un click generico su "Continua" non aggiungerebbe
          niente e sdoppierebbe il conteggio di ogni passo.
        */}
        <div
          className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
          data-track="manual"
        >
          {safeIndex > 0 ? (
            <button
              type="button"
              onClick={goPrev}
              className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              ← Indietro
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={goNext}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(107,33,255,0.55)] transition-all hover:bg-brand-dark hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-hairline disabled:text-ink-soft disabled:shadow-none disabled:hover:translate-y-0 sm:w-auto"
          >
            {safeIndex >= total - 1
              ? submitting
                ? "Invio in corso…"
                : "Prenota il check-up gratuito"
              : "Continua →"}
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-ink-soft">
          Premi <kbd className="rounded border border-hairline bg-white px-1.5 py-0.5 text-[10px] font-semibold">Invio ↵</kbd> per continuare
        </p>
      </div>
    </main>
  );
}

// -------------------- question card --------------------

function QuestionCard({
  q,
  state,
  set,
  touched,
  error,
  onEnter,
}: {
  q: Question;
  state: State;
  set: <K extends keyof State>(k: K, v: State[K]) => void;
  touched: boolean;
  error: string | null;
  onEnter: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Focus the input when the question changes
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [q.key]);

  const showErr = touched && error;

  return (
    <div key={q.key as string} className="animate-[fadeInUp_.35s_ease-out]">
      {q.intro && (
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand">
          {q.intro}
        </div>
      )}
      <h1 className="text-3xl leading-tight text-ink sm:text-4xl">{q.label}</h1>
      {q.hint && <p className="mt-3 text-base text-ink-soft">{q.hint}</p>}

      <div className="mt-8">
        {(q.type === "text" || q.type === "email" || q.type === "tel") && (
          <>
            <input
              ref={(el) => { inputRef.current = el; }}
              type={q.type}
              value={state[q.key] as string}
              onChange={(e) => set(q.key, e.target.value as never)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEnter();
                }
              }}
              placeholder={"placeholder" in q ? q.placeholder : undefined}
              autoComplete={"autoComplete" in q ? q.autoComplete : undefined}
              inputMode={q.type === "tel" ? "tel" : q.type === "email" ? "email" : undefined}
              className={`w-full border-b-2 bg-transparent px-1 py-3 text-2xl outline-none transition-colors placeholder:text-ink-soft/50 focus:border-brand ${
                showErr ? "border-danger" : "border-hairline"
              }`}
            />
            {showErr && <p className="mt-2 text-sm text-danger">{error}</p>}
          </>
        )}

        {q.type === "textarea" && (
          <textarea
            ref={(el) => { inputRef.current = el; }}
            value={state[q.key] as string}
            onChange={(e) => set(q.key, e.target.value as never)}
            rows={4}
            placeholder={q.placeholder}
            className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base outline-none transition-colors focus:border-brand"
          />
        )}

        {q.type === "choice" && (
          <ChoiceList
            options={q.options}
            value={state[q.key] as string}
            onSelect={(v) => {
              set(q.key, v as never);
              // Auto-advance on choice select (Typeform style)
              setTimeout(() => onEnter(), 220);
            }}
          />
        )}

        {q.type === "choice" && showErr && (
          <p className="mt-3 text-sm text-danger">{error}</p>
        )}

        {q.type === "consent" && (
          <div className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-hairline bg-white p-4">
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
            {showErr && <p className="text-sm text-danger">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------- choice list (vertical, Typeform style) --------------------

function ChoiceList({
  options,
  value,
  onSelect,
}: {
  options: string[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    // Le risposte fanno avanzare da sole: il click è già raccontato da
    // `form_step`, con la domanda e il passo.
    <div className="flex flex-col gap-3" data-track="manual">
      {options.map((opt, i) => {
        const selected = value === opt;
        const letter = String.fromCharCode(65 + i);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`group flex w-full items-center gap-4 rounded-xl border-2 bg-white px-5 py-4 text-left text-base transition-all sm:text-lg ${
              selected
                ? "border-brand bg-brand/5 shadow-[0_8px_24px_-12px_rgba(107,33,255,0.5)]"
                : "border-hairline hover:border-brand/60 hover:bg-brand/[0.02]"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                selected
                  ? "border-brand bg-brand text-white"
                  : "border-hairline bg-surface text-ink-soft group-hover:border-brand group-hover:text-brand"
              }`}
            >
              {letter}
            </span>
            <span className={selected ? "font-semibold text-ink" : "text-ink"}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
