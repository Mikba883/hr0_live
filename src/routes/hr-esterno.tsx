import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ClipboardList,
  UserSearch,
  Cog,
  Rocket,
  GraduationCap,
  Heart,
} from "lucide-react";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { CtaButton } from "@/components/landing/CtaButton";
import { Card } from "@/components/landing/Card";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { LeadForm } from "@/components/landing/LeadForm";
import { Section, H2, Eyebrow } from "@/components/landing/Section";
import { StickyMobileCta } from "@/components/landing/StickyMobileCta";

export const Route = createFileRoute("/hr-esterno")({
  head: () => ({
    meta: [
      { title: "HR esterno per PMI: direzione HR a giornate | Call gratuita" },
      { name: "description", content: "Direzione HR esterna per PMI: 4-8 giornate al mese in azienda. Selezione, onboarding, processi. Call gratuita di dimensionamento." },
      { property: "og:title", content: "Direzione HR esterna per PMI, a giornate" },
      { property: "og:description", content: "Entro in azienda come responsabile HR a tempo, con obiettivi e KPI. Call gratuita di 30 minuti." },
      { property: "og:url", content: "https://hr0-sparkle-connect.lovable.app/hr-esterno" },
    ],
    links: [{ rel: "canonical", href: "https://hr0-sparkle-connect.lovable.app/hr-esterno" }],
  }),
  component: HrEsternoPage,
});

const attivita = [
  { icon: <ClipboardList className="h-6 w-6" />, t: "Audit e mappatura", d: "Fotografia reale dell'organizzazione: ruoli, sovrapposizioni, buchi, turnover. Le criticità in ordine di priorità." },
  { icon: <UserSearch className="h-6 w-6" />, t: "Selezioni", d: "Gestisco io le ricerche aperte: sourcing, colloqui strutturati, shortlist, offerta. Con garanzia di sostituzione 6 mesi." },
  { icon: <Cog className="h-6 w-6" />, t: "Sistema di selezione", d: "Costruisco il motore che resta: job description a competenze, scorecard, database candidati. Tuo per sempre." },
  { icon: <Rocket className="h-6 w-6" />, t: "Onboarding", d: "Piano 30/60/90 giorni per ogni nuovo ingresso: le persone restano e rendono prima." },
  { icon: <GraduationCap className="h-6 w-6" />, t: "Formazione finanziata", d: "Piano formativo coperto in gran parte dai Fondi Interprofessionali: soldi che la tua azienda versa già e non usa." },
  { icon: <Heart className="h-6 w-6" />, t: "Clima e cultura", d: "Interventi concreti ad alto impatto: feedback, rituali, comunicazione interna. Niente poster motivazionali." },
];

const tappe = [
  { n: "1", t: "Call di dimensionamento (gratuita)", d: "30 minuti: capiamo priorità, urgenze e quante giornate servono davvero. Se ne bastano poche, te lo dico." },
  { n: "2", t: "Kickoff e patto iniziale", d: "Definiamo insieme i 3 risultati prioritari, i KPI e la cadenza. Tutto scritto." },
  { n: "3", t: "Esecuzione (3-6 mesi)", d: "Sono in azienda nelle giornate concordate: selezioni, processi, formazione. Report mensile sui KPI." },
  { n: "4", t: "Handover", d: "Ti lascio sistemi, template e processi funzionanti. Poi decidi tu: proseguire con una formula leggera di continuità, o camminare da solo." },
];

const rows = [
  { label: "Costo annuo", a: "65-90.000€ (RAL 50-70k + oneri)", b: "Variabile, a progetto", c: "Una frazione: paghi solo le giornate" },
  { label: "Presenza in azienda", a: "Full-time (spesso sovradimensionato per una PMI)", b: "Quasi nulla: analisi e report", c: "4-8 giornate/mese, fisicamente in azienda" },
  { label: "Responsabilità operativa", a: "Sì", b: "No: consiglia, non esegue", c: "Sì: gestisco selezioni, colloqui, onboarding" },
  { label: "Cosa resta quando finisce", a: "—", b: "Un report", c: "Processi, template e sistemi che restano tuoi" },
  { label: "Tempo per trovarlo", a: "4-6 mesi di ricerca (e se sbagli...)", b: "Immediato", c: "Operativo in 1-2 settimane" },
];

const faq = [
  { q: "Che differenza c'è con un consulente HR classico?", a: "Il consulente analizza e consiglia; io eseguo. Conduco io i colloqui, gestisco io le selezioni, costruisco io i processi. Responsabilità operativa, non slide." },
  { q: "E rispetto a un temporary manager?", a: "Il temporary è full-time per un periodo: ha senso in crisi o transizioni straordinarie. La formula a giornate è pensata per la normalità di una PMI: presenza regolare, costi proporzionati, continuità." },
  { q: "La mia azienda è piccola, ha senso?", a: "Sotto i 10-15 dipendenti probabilmente no, e te lo dirò in call. Tra 15 e 100 è esattamente la taglia per cui questa formula nasce." },
  { q: "Quanto costa?", a: "Dipende dalle giornate e dal perimetro. La call di dimensionamento serve esattamente a questo: esci con una proposta chiara, con numeri, senza sorprese. E buona parte della componente formativa è finanziabile." },
  { q: "Sei tu fisicamente o mandi qualcuno?", a: "Sono io. È il motivo per cui prendo poche aziende in parallelo." },
];

function HrEsternoPage() {
  return (
    <main className="bg-surface pb-24 md:pb-0">
      <AnnouncementBar tag="NUOVO">
        Direzione HR esterna a giornate ·{" "}
        <a href="#form" className="text-brand underline underline-offset-2">Call gratuita di dimensionamento</a>
      </AnnouncementBar>

      {/* Hero */}
      <section id="hero" className="px-5 pt-20 pb-20 sm:pt-32 sm:pb-28">
        <div className="mx-auto max-w-5xl text-center">
          <Eyebrow>Direzione HR esterna per PMI</Eyebrow>
          <h1 className="text-[44px] leading-[0.95] sm:text-7xl md:text-8xl text-ink">
            Una direzione HR in azienda,{" "}
            <span className="text-brand">4-8 giornate al mese</span>. Senza assumere un HR manager.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-ink-soft sm:text-xl">
            Selezione, onboarding, formazione, processi: entro nella tua azienda
            come responsabile HR a tempo, con obiettivi e KPI definiti. Tu torni
            a fare l'imprenditore, io mi occupo delle persone.
          </p>
          <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4">
            <CtaButton href="#form">Verifica se fa per te — call gratuita di 30 min →</CtaButton>
            <p className="text-xs uppercase tracking-widest text-ink-soft">
              Dimensioniamo insieme · Nessun impegno · Onesto anche se non ti serve
            </p>
          </div>
        </div>
      </section>

      {/* Tabella comparativa */}
      <Section className="bg-white border-t border-hairline">
        <H2>I conti che stai già facendo, messi in fila</H2>

        {/* Desktop table */}
        <div className="mt-10 hidden md:block overflow-hidden rounded-2xl border border-hairline">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface">
                <th className="p-4 font-semibold text-ink"></th>
                <th className="p-4 font-semibold text-ink-soft">HR Manager interno</th>
                <th className="p-4 font-semibold text-ink-soft">Consulenza spot</th>
                <th className="p-4 font-semibold text-brand">
                  HR esterno a giornate
                  <span className="ml-2 inline-block rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    La formula
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} className={i % 2 === 0 ? "bg-white" : "bg-surface/60"}>
                  <td className="p-4 font-semibold text-ink">{r.label}</td>
                  <td className="p-4 text-ink-soft">{r.a}</td>
                  <td className="p-4 text-ink-soft">{r.b}</td>
                  <td className="p-4 text-ink border-l-2 border-brand bg-info-bg/40">{r.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mt-10 grid gap-4 md:hidden">
          {[
            { title: "HR Manager interno", cells: rows.map((r) => ({ l: r.label, v: r.a })), highlight: false },
            { title: "Consulenza spot", cells: rows.map((r) => ({ l: r.label, v: r.b })), highlight: false },
            { title: "HR esterno a giornate", cells: rows.map((r) => ({ l: r.label, v: r.c })), highlight: true },
          ].map((col) => (
            <div
              key={col.title}
              className={`rounded-2xl border p-5 ${
                col.highlight ? "border-brand bg-info-bg/50" : "border-hairline bg-white"
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                <h3 className="font-display text-base uppercase tracking-tight text-ink">
                  {col.title}
                </h3>
                {col.highlight && (
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    La formula
                  </span>
                )}
              </div>
              <dl className="space-y-2 text-sm">
                {col.cells.map((c) => (
                  <div key={c.l}>
                    <dt className="font-semibold text-ink">{c.l}</dt>
                    <dd className="text-ink-soft">{c.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-lg text-ink-soft">
          Per un'azienda tra i 15 e i 100 dipendenti, un HR manager full-time è
          quasi sempre sovradimensionato: non c'è abbastanza lavoro strategico
          per riempire 5 giorni a settimana, e finisce a fare amministrazione.
          Le giornate giuste, con la persona giusta, coprono tutto ciò che serve
          davvero.
        </p>
      </Section>

      {/* Cosa faccio */}
      <Section>
        <H2>Cosa succede nelle mie giornate in azienda</H2>
        <p className="mt-4 max-w-3xl text-lg text-ink-soft">
          Niente fumo: ecco il perimetro operativo, quello che concordiamo al
          kickoff con obiettivi e KPI scritti.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {attivita.map((a) => (
            <Card key={a.t} icon={a.icon} title={a.t}>
              {a.d}
            </Card>
          ))}
        </div>
      </Section>

      {/* Timeline */}
      <Section className="bg-white border-t border-hairline">
        <H2>Dal primo giorno all'autonomia</H2>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {tappe.map((t) => (
            <div key={t.n} className="rounded-2xl border border-hairline bg-white p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-semibold text-white">
                {t.n}
              </div>
              <h3 className="mb-2 font-display text-base uppercase tracking-tight text-ink">
                {t.t}
              </h3>
              <p className="text-sm text-ink-soft">{t.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-brand/30 bg-info-bg p-6">
          <p className="text-base text-ink">
            <span className="font-semibold">Nota di trasparenza:</span> il mio
            obiettivo dichiarato è rendermi meno necessario nel tempo:
            costruisco sistemi che la tua azienda sa usare, non dipendenza dal
            consulente.
          </p>
        </div>
      </Section>

      {/* Chi sono */}
      <Section>
        <H2>La persona che entrerà nella tua azienda</H2>
        <div className="mt-10 grid gap-8 md:grid-cols-[240px_1fr] md:items-start">
          <div className="mx-auto flex aspect-square w-full max-w-[240px] items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark font-display text-6xl text-white">
            MB
          </div>
          <div className="space-y-4 text-lg text-ink-soft">
            <p>
              Mi chiamo <span className="font-semibold text-ink">Michele Baroni</span>.{" "}
              [2-3 righe sul percorso: esperienze chiave, eventuali brand
              riconoscibili — se hai lavorato con realtà come Bain & Company,
              dillo qui, per un imprenditore vale più di mille aggettivi].
            </p>
            <p>
              Ho scelto di lavorare con le PMI perché è dove le persone giuste —
              o sbagliate — cambiano davvero il destino dell'azienda, e dove
              nessuno ti dà gli strumenti delle grandi organizzazioni.
            </p>
            <p className="text-ink">
              Lavoro con un numero limitato di aziende in parallelo: quando sono
              da te, sono da te.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["[Anni di esperienza]", "[N. selezioni gestite / aziende seguite]", "Garanzia di sostituzione su ogni inserimento"].map((b) => (
            <div
              key={b}
              className="flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-3 text-sm font-semibold text-ink"
            >
              <Check className="h-4 w-4 shrink-0 text-brand" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-white border-t border-hairline">
        <H2>Le domande che ti stai facendo</H2>
        <div className="mt-8">
          <Faq items={faq} />
        </div>
      </Section>

      {/* CTA finale */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <H2>Prima capiamo se e quanto ti serve. Poi parliamo di numeri.</H2>
          <p className="mt-4 text-lg text-ink-soft">
            30 minuti di call: analizziamo la tua situazione, definiamo le
            priorità e ti dico quante giornate servirebbero davvero — anche se
            la risposta è "poche" o "nessuna".
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-xl">
          <LeadForm ctaLabel="Prenota la call di dimensionamento →" />
        </div>
      </Section>

      <Footer />
      <StickyMobileCta />
    </main>
  );
}
