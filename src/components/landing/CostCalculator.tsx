import { useMemo, useState } from "react";

const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label className="text-sm font-semibold text-ink">{label}</label>
        <span className="text-base font-semibold text-brand">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[color:var(--color-brand)]"
      />
    </div>
  );
}

export function CostCalculator() {
  const [ral, setRal] = useState(40000);
  const [mesi, setMesi] = useState(4);
  const [sbagliate, setSbagliate] = useState(1);
  const [giorni, setGiorni] = useState(2);

  const { scoperto, costoSbagliate, tempo, totale } = useMemo(() => {
    const scoperto = (ral * 1.5) / 12 * mesi;
    const costoSbagliate = sbagliate * ral * 0.35;
    const tempo = giorni * 12 * 500;
    return { scoperto, costoSbagliate, tempo, totale: scoperto + costoSbagliate + tempo };
  }, [ral, mesi, sbagliate, giorni]);

  return (
    <div id="calcolatore" className="rounded-xl border border-hairline bg-white p-6 sm:p-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Slider
            label="RAL media dei ruoli che cerchi"
            value={ral}
            min={25000}
            max={80000}
            step={5000}
            format={eur}
            onChange={setRal}
          />
          <Slider
            label="Mesi in cui l'ultima posizione è rimasta scoperta"
            value={mesi}
            min={1}
            max={12}
            format={(v) => `${v} ${v === 1 ? "mese" : "mesi"}`}
            onChange={setMesi}
          />
          <Slider
            label="Assunzioni sbagliate negli ultimi 2 anni"
            value={sbagliate}
            min={0}
            max={5}
            format={(v) => `${v}`}
            onChange={setSbagliate}
          />
          <Slider
            label="Giorni al mese che dedichi a CV e colloqui"
            value={giorni}
            min={0}
            max={6}
            format={(v) => `${v} ${v === 1 ? "giorno" : "giorni"}`}
            onChange={setGiorni}
          />
        </div>

        <div className="flex flex-col justify-center rounded-lg bg-surface p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Costo nascosto annuo
          </p>
          <p
            className="mt-2 font-semibold text-danger"
            style={{ fontSize: "56px", lineHeight: 1.05 }}
          >
            {eur(totale)}
          </p>
          <div className="mt-6 space-y-1 text-left text-sm text-ink-soft">
            <div className="flex justify-between"><span>Ruolo scoperto</span><span>{eur(scoperto)}</span></div>
            <div className="flex justify-between"><span>Assunzioni sbagliate</span><span>{eur(costoSbagliate)}</span></div>
            <div className="flex justify-between"><span>Il tuo tempo</span><span>{eur(tempo)}</span></div>
          </div>
          <p className="mt-6 text-left text-sm text-ink-soft">
            Questo numero non lo vedi in bilancio. Ma c'è. Ed è prudente: non include i
            clienti persi, gli errori di chi copre due ruoli, il morale del team.
          </p>
          <a
            href="#form"
            className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-brand px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Voglio capire come ridurlo →
          </a>
        </div>
      </div>
    </div>
  );
}
