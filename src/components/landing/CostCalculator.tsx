import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics";

const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

function clamp(v: number, min: number, max: number) {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

function Field({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <label className="min-w-0 text-sm font-semibold text-ink">{label}</label>
        <span className="shrink-0 text-base font-semibold text-brand">
          {format(value)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-6 w-full accent-[color:var(--color-brand)]"
        />
        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-hairline bg-white px-2 py-1">
          <input
            type="number"
            inputMode="numeric"
            aria-label={`${label} (valore esatto)`}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(clamp(Number(e.target.value), min, max))}
            className="w-16 bg-transparent text-right text-sm font-semibold text-ink outline-none"
          />
          {suffix && <span className="text-xs text-ink-soft">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

function useCountUp(target: number) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    const duration = 500;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (target - from) * eased;
      setDisplay(v);
      fromRef.current = v;
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return display;
}

/**
 * Segnala le regolazioni degli slider senza sommergere GA4.
 *
 * Uno slider trascinato emette un `change` a ogni pixel: mandarli tutti
 * significherebbe centinaia di eventi per una singola sessione, il superamento
 * dei limiti di GA4 e un report illeggibile. Si aspetta invece che la mano si
 * fermi — 800 ms — e si manda solo il valore su cui si è fermata, che è l'unico
 * interessante: nessuno vuole sapere che è passato da 41.000 a 42.000, ma dove
 * ha deciso di lasciare il cursore.
 *
 * Il debounce è per campo: regolare la RAL non annulla l'evento in coda dei
 * mesi.
 */
function useTracciaRegolazione() {
  const timer = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const iniziato = useRef(false);

  useEffect(() => {
    const attivi = timer.current;
    // Chi cambia pagina mentre un evento è in coda non deve lasciarsi dietro un
    // timer che scatta su un componente smontato.
    return () => {
      for (const t of Object.values(attivi)) clearTimeout(t);
    };
  }, []);

  return useCallback((campo: string, valore: number) => {
    if (!iniziato.current) {
      iniziato.current = true;
      // Una sola volta per sessione di calcolo: dice quanti hanno toccato il
      // calcolatore, che è il numero che serve per il tasso di interazione.
      trackEvent("calculator_start");
    }

    clearTimeout(timer.current[campo]);
    timer.current[campo] = setTimeout(() => {
      trackEvent("calculator_adjust", { campo, valore });
    }, 800);
  }, []);
}

export function CostCalculator() {
  const [ral, setRal] = useState(40000);
  const [mesi, setMesi] = useState(4);
  const [sbagliate, setSbagliate] = useState(1);
  const [giorni, setGiorni] = useState(2);

  const { scoperto, costoSbagliate, tempo, totale } = useMemo(() => {
    const scoperto = ((ral * 1.5) / 12) * mesi;
    const costoSbagliate = sbagliate * ral * 0.35;
    const tempo = giorni * 12 * 500;
    return {
      scoperto,
      costoSbagliate,
      tempo,
      totale: scoperto + costoSbagliate + tempo,
    };
  }, [ral, mesi, sbagliate, giorni]);

  const animato = useCountUp(totale);
  const traccia = useTracciaRegolazione();

  /** Aggiorna lo stato e segnala la regolazione, con lo stesso gesto. */
  const regola = (campo: string, set: (v: number) => void) => (v: number) => {
    set(v);
    traccia(campo, v);
  };

  const voci = [
    { label: "Ruolo scoperto", value: scoperto, color: "bg-danger" },
    { label: "Assunzioni sbagliate", value: costoSbagliate, color: "bg-brand" },
    { label: "Il tuo tempo", value: tempo, color: "bg-ink/50" },
  ];
  const somma = totale || 1;

  return (
    <div id="calcolatore" className="rounded-2xl border border-hairline bg-white p-6 sm:p-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-7">
          <Field
            label="RAL media dei ruoli che cerchi"
            value={ral}
            min={25000}
            max={80000}
            step={1000}
            suffix="€"
            format={eur}
            onChange={regola("ral", setRal)}
          />
          <Field
            label="Mesi in cui l'ultima posizione è rimasta scoperta"
            value={mesi}
            min={1}
            max={12}
            suffix="mesi"
            format={(v) => `${v} ${v === 1 ? "mese" : "mesi"}`}
            onChange={regola("mesi", setMesi)}
          />
          <Field
            label="Assunzioni sbagliate negli ultimi 2 anni"
            value={sbagliate}
            min={0}
            max={5}
            format={(v) => `${v}`}
            onChange={regola("sbagliate", setSbagliate)}
          />
          <Field
            label="Giorni al mese che dedichi a CV e colloqui"
            value={giorni}
            min={0}
            max={6}
            suffix="gg"
            format={(v) => `${v} ${v === 1 ? "giorno" : "giorni"}`}
            onChange={regola("giorni", setGiorni)}
          />
        </div>

        <div className="flex flex-col justify-center rounded-2xl bg-surface p-6 text-center sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Costo nascosto annuo
          </p>
          <p
            aria-live="polite"
            className="display mt-3 text-[64px] leading-[0.95] font-extrabold tracking-tight text-danger sm:text-[92px]"
          >
            {eur(animato)}
          </p>

          {/* Composizione visiva della somma */}
          <div className="mt-6 flex h-3 w-full overflow-hidden rounded-full bg-hairline">
            {voci.map((v) => (
              <div
                key={v.label}
                className={`${v.color} h-full transition-all duration-500`}
                style={{ width: `${(v.value / somma) * 100}%` }}
              />
            ))}
          </div>

          <div className="mt-5 space-y-2 text-left text-sm text-ink-soft">
            {voci.map((v) => (
              <div key={v.label} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${v.color}`} />
                  <span className="truncate">{v.label}</span>
                </span>
                <span className="shrink-0 font-semibold text-ink">+ {eur(v.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-hairline pt-2 text-base">
              <span className="font-semibold text-ink">Totale</span>
              <span className="font-extrabold text-danger">{eur(totale)}</span>
            </div>
          </div>

          <a
            href="/check-up"
            onClick={() =>
              trackEvent("cta_click", {
                etichetta: "Voglio capire come ridurlo",
                destinazione: "/check-up",
                pagina: typeof window === "undefined" ? "" : window.location.pathname,
                // Il totale calcolato: dice se chi clicca è chi ha visto un
                // numero grande o se il valore mostrato non c'entra.
                totale_calcolato: Math.round(totale),
              })
            }
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brand px-6 py-4 text-base font-semibold text-white shadow-[0_6px_20px_-8px_rgba(107,33,255,0.4)] transition-colors hover:bg-brand-dark"
          >
            Voglio capire come ridurlo →
          </a>
          <p className="mt-3 text-xs text-ink-soft">
            Nessuna newsletter · Nessun impegno · Rispondo io, non un commerciale
          </p>

          <p className="mt-6 text-left text-sm text-ink-soft">
            Questo numero non lo vedi in bilancio. Ma c'è. Ed è prudente: non include i
            clienti persi, gli errori di chi copre due ruoli, il morale del team.
          </p>
        </div>
      </div>
    </div>
  );
}
