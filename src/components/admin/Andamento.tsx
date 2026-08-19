/**
 * L'andamento: quanti lead sono arrivati e quanto hai lavorato, nel tempo.
 *
 * Tre serie (lead arrivati, azioni fatte, trattative vinte) disegnate come
 * small multiples — una riga per serie, stesso asse orizzontale — invece che a
 * barre raggruppate: con 14 giorni le barre affiancate diventerebbero 42 stecche
 * illeggibili, e ogni riga con una serie sola non ha bisogno di legenda perché
 * il titolo della riga la nomina già.
 *
 * Sotto, il diario: le azioni giorno per giorno, così sai cos'hai fatto davvero
 * e non solo quante cose hai fatto.
 */

import { useMemo, useState } from "react";
import {
  andamento,
  nomeGiorno,
  oraDi,
  perGiorno,
  tipoInfo,
  type Attivita,
  type Granularita,
} from "@/lib/attivita";
import type { Lead } from "@/lib/leads";

/**
 * I tre colori delle serie. Validati per daltonismo contro lo sfondo bianco
 * (ΔE deutan 12.5 sulla coppia peggiore) e scelti in continuità con i colori
 * di stato già usati nella pipeline: viola il brand, verde il vinto.
 */
const SERIE = [
  { chiave: "leadArrivati", titolo: "Lead arrivati", colore: "#6B21FF" },
  { chiave: "azioni", titolo: "Azioni fatte", colore: "#0284C7" },
  { chiave: "vinti", titolo: "Trattative vinte", colore: "#059669" },
] as const;

export function Andamento({
  leads,
  attivita,
  onApri,
}: {
  leads: Lead[];
  attivita: Attivita[];
  onApri: (id: string) => void;
}) {
  const [granularita, setGranularita] = useState<Granularita>("giorno");
  const [tabella, setTabella] = useState(false);

  const quanti = granularita === "giorno" ? 14 : 12;
  const barre = useMemo(
    () => andamento(leads, attivita, granularita, quanti),
    [leads, attivita, granularita, quanti],
  );

  return (
    <div className="mt-5 space-y-5">
      {/* Un'unica riga di filtri sopra tutto ciò che governa */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full border border-hairline bg-white p-1">
          <BottoneScala attivo={granularita === "giorno"} onClick={() => setGranularita("giorno")}>
            Ultimi 14 giorni
          </BottoneScala>
          <BottoneScala attivo={granularita === "mese"} onClick={() => setGranularita("mese")}>
            Ultimi 12 mesi
          </BottoneScala>
        </div>
        <button
          onClick={() => setTabella((v) => !v)}
          className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          {tabella ? "Mostra il grafico" : "Mostra i numeri in tabella"}
        </button>
      </div>

      <section className="rounded-2xl border border-hairline bg-white p-5">
        {tabella ? (
          <Tabella barre={barre} />
        ) : (
          <div className="space-y-6">
            {SERIE.map((s) => (
              <Serie
                key={s.chiave}
                titolo={s.titolo}
                colore={s.colore}
                valori={barre.map((b) => ({ etichetta: b.etichetta, valore: b[s.chiave] }))}
              />
            ))}
          </div>
        )}
      </section>

      <Diario attivita={attivita} leads={leads} onApri={onApri} />
    </div>
  );
}

// -------------------- grafico --------------------

type Valore = { etichetta: string; valore: number };

/**
 * Altezza della barra in percentuale del picco.
 *
 * Il minimo del 4% serve a non far sparire un valore piccolo ma diverso da
 * zero: una giornata con una telefonata deve restare distinguibile da una
 * giornata vuota, che invece resta a zero.
 */
function altezza(valore: number, massimo: number): string {
  if (massimo === 0 || valore === 0) return "0%";
  return `${Math.max((valore / massimo) * 100, 4)}%`;
}

function Serie({ titolo, colore, valori }: { titolo: string; colore: string; valori: Valore[] }) {
  const massimo = Math.max(...valori.map((v) => v.valore));
  const totale = valori.reduce((n, v) => n + v.valore, 0);

  // Etichetta diretta solo sul picco: un numero su ogni barra sarebbe rumore,
  // e il valore esatto resta comunque leggibile al passaggio del mouse e in tabella.
  const indicePicco = valori.findIndex((v) => v.valore === massimo && v.valore > 0);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colore }} />
          {titolo}
        </h3>
        <span className="text-xs text-ink-soft">{totale} nel periodo</span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[520px]">
          {/* gap-[2px]: le barre si separano con un vuoto di superficie, non con un bordo */}
          <div className="flex h-20 items-end gap-[2px]">
            {valori.map((v, i) => (
              <div key={v.etichetta} className="relative flex flex-1 items-end justify-center">
                {i === indicePicco && (
                  <span className="absolute -top-1 text-[10px] font-bold text-ink-soft">
                    {v.valore}
                  </span>
                )}
                <div
                  title={`${v.etichetta}: ${v.valore}`}
                  className="w-full rounded-t"
                  style={{ height: altezza(v.valore, massimo), backgroundColor: colore }}
                />
              </div>
            ))}
          </div>

          {/* Asse: una hairline continua, mai tratteggiata */}
          <div className="mt-1 border-t border-hairline" />

          <div className="mt-1.5 flex gap-[2px]">
            {valori.map((v) => (
              <span
                key={v.etichetta}
                className="flex-1 text-center text-[10px] tabular-nums text-ink-soft"
              >
                {v.etichetta}
              </span>
            ))}
          </div>
        </div>
      </div>

      {massimo === 0 && (
        <p className="mt-2 text-xs text-ink-soft">Niente in questo periodo.</p>
      )}
    </div>
  );
}

function Tabella({
  barre,
}: {
  barre: { etichetta: string; leadArrivati: number; azioni: number; vinti: number }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-xs uppercase tracking-wider text-ink-soft">
            <th className="py-2 pr-3 font-semibold">Periodo</th>
            <th className="py-2 pr-3 text-right font-semibold">Lead arrivati</th>
            <th className="py-2 pr-3 text-right font-semibold">Azioni fatte</th>
            <th className="py-2 text-right font-semibold">Vinte</th>
          </tr>
        </thead>
        <tbody>
          {barre.map((b) => (
            <tr key={b.etichetta} className="border-b border-hairline last:border-b-0">
              <td className="py-2 pr-3 text-ink">{b.etichetta}</td>
              <td className="py-2 pr-3 text-right tabular-nums text-ink">{b.leadArrivati}</td>
              <td className="py-2 pr-3 text-right tabular-nums text-ink">{b.azioni}</td>
              <td className="py-2 text-right tabular-nums text-ink">{b.vinti}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -------------------- diario --------------------

function Diario({
  attivita,
  leads,
  onApri,
}: {
  attivita: Attivita[];
  leads: Lead[];
  onApri: (id: string) => void;
}) {
  const giornate = useMemo(() => perGiorno(attivita).slice(0, 30), [attivita]);
  const nomeDi = (id: string) => leads.find((l) => l.id === id)?.nome ?? "Lead rimosso";

  return (
    <section className="rounded-2xl border border-hairline bg-white p-5">
      <h2 className="text-lg text-ink">Diario</h2>
      <p className="mt-1 text-sm text-ink-soft">Cos'hai fatto, giorno per giorno.</p>

      {giornate.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          Ancora nessuna azione registrata. Ogni volta che premi “Fatto” su un lead, finisce qui.
        </p>
      ) : (
        <div className="mt-4 space-y-5">
          {giornate.map((g) => (
            <div key={g.giorno}>
              <h3 className="flex items-baseline gap-2 text-sm font-bold text-ink">
                {nomeGiorno(g.giorno)}
                <span className="text-xs font-semibold text-ink-soft">
                  {g.attivita.length} {g.attivita.length === 1 ? "azione" : "azioni"}
                </span>
              </h3>
              <ul className="mt-2 space-y-1.5">
                {g.attivita.map((a) => {
                  const t = tipoInfo(a.tipo);
                  return (
                    <li key={a.id} className="flex flex-wrap items-baseline gap-2 text-sm">
                      <span className="tabular-nums text-xs text-ink-soft">{oraDi(a.fatta_at)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${t.chip}`}>
                        {t.label}
                      </span>
                      <button
                        onClick={() => onApri(a.lead_id)}
                        className="font-semibold text-ink underline-offset-4 hover:underline"
                      >
                        {nomeDi(a.lead_id)}
                      </button>
                      {a.descrizione && <span className="text-ink-soft">— {a.descrizione}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function BottoneScala({
  attivo,
  onClick,
  children,
}: {
  attivo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        attivo ? "bg-brand text-white" : "text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
