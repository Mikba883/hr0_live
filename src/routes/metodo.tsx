import { createFileRoute } from "@tanstack/react-router";
import { Check, X, Lightbulb } from "lucide-react";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { CtaButton } from "@/components/landing/CtaButton";
import { Card } from "@/components/landing/Card";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { ProcessTimeline } from "@/components/landing/ProcessTimeline";
import { Section, H2, Eyebrow } from "@/components/landing/Section";
import { StickyMobileCta } from "@/components/landing/StickyMobileCta";
import { VideoEmbed } from "@/components/landing/VideoEmbed";

export const Route = createFileRoute("/metodo")({
  head: () => ({
    meta: [
      { title: "Assumere senza agenzie: impara il metodo | Check-up gratuito" },
      { name: "description", content: "Costruisci il metodo di assunzione dentro la tua azienda, sulla prima posizione vera da coprire. Check-up gratuito di 30 minuti." },
      { property: "og:title", content: "Assumere senza agenzie: impara il metodo" },
      { property: "og:description", content: "Impari il processo sulla tua posizione aperta. Nessun corso teorico. Check-up gratuito." },
      { property: "og:url", content: "https://hr0-sparkle-connect.lovable.app/metodo" },
    ],
    links: [{ rel: "canonical", href: "https://hr0-sparkle-connect.lovable.app/metodo" }],
  }),
  component: MetodoPage,
});

const opzioni = [
  { t: "Fai da solo", d: "Annuncio, passaparola, colloqui a sensazione. Gratis in apparenza, ma lo paghi in mesi di ruolo scoperto e assunzioni sbagliate da 18.000€ l'una." },
  { t: "Agenzia / head hunter", d: "Funziona, ma paghi il 20-25% della RAL. Ogni. Singola. Volta. E il metodo resta loro: alla prossima ricerca sei punto e a capo." },
  { t: "Corso di recruiting", d: "Teoria in aula su casi finti. Torni in azienda e non sai da dove cominciare sulla TUA posizione aperta." },
];

const risultati = [
  { t: "La posizione è coperta", d: "La persona giusta è assunta, con garanzia di sostituzione 6 mesi." },
  { t: "La tua persona sa rifarlo", d: "Job description, ricerca candidati, colloqui strutturati, offerta: autonoma sui ruoli standard." },
  { t: "Il metodo resta a te", d: "Template, scorecard, griglie di colloquio, checklist: il toolkit è tuo per sempre." },
];

const perChi = [
  "Hai una posizione aperta adesso (o in arrivo nei prossimi mesi)",
  "C'è una persona in azienda con la voglia di imparare",
  "Assumerai ancora nei prossimi anni e vuoi smettere di ripartire da zero",
  "Preferisci investire una volta nel metodo che pagare fee per sempre",
];

const nonPerChi = [
  "Cerchi qualcuno che ti risolva tutto senza coinvolgerti (esiste anche quello, ma è un altro servizio — parliamone)",
  "Assumi una persona ogni 5 anni",
  "Cerchi profili dirigenziali ultra-specializzati (per quelli serve un approccio diverso)",
];

const faq = [
  { q: "Non ho tempo per un percorso di formazione.", a: "Non è un corso. Lavoriamo sulla posizione che devi comunque coprire: quel tempo lo spenderesti lo stesso. Solo che così ne esci con un'assunzione fatta E un metodo che resta." },
  { q: "La mia persona interna non ha esperienza HR.", a: "Perfetto: meglio. Il metodo è pensato per chi parte da zero. Serve organizzazione e voglia di imparare, non un curriculum da recruiter." },
  { q: "E se poi il candidato se ne va?", a: "Garanzia: se lascia entro 6 mesi, riattiviamo la ricerca senza costi aggiuntivi." },
  { q: "Quanto costa?", a: "Dipende dalla complessità del ruolo e da quanto è finanziabile per la tua azienda. È esattamente quello che vediamo nel check-up: esci con i numeri, poi decidi con calma." },
];

function MetodoPage() {
  return (
    <main className="bg-surface pb-24 md:pb-0">
      <AnnouncementBar tag="NUOVO">
        Costruisci il metodo di assunzione dentro la tua azienda ·{" "}
        <a href="/check-up" className="text-brand underline underline-offset-2">Check-up gratis</a>
      </AnnouncementBar>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden px-5 pt-20 pb-20 sm:pt-32 sm:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(107,33,255,0.08),transparent_65%)]"
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <Eyebrow>Per PMI che vogliono smettere di dipendere dalle agenzie</Eyebrow>
          <h1 className="text-[40px] leading-[1.05] sm:text-[56px] md:text-[68px] text-ink">
            Trovare personale non è questione di{" "}
            <span className="text-brand">fortuna.</span>
          </h1>
          <div className="mx-auto mt-10 max-w-3xl">
            <VideoEmbed videoId="x2lul0gEWPE" title="Come funziona il metodo HR0" />
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-lg text-ink-soft sm:text-xl">
            Le agenzie ti chiedono il 20-25% della RAL a ogni ricerca, per sempre.
            C'è un'alternativa: costruire il metodo dentro la tua azienda, sulla
            prima posizione vera che devi coprire.
          </p>
          <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4">
            <CtaButton href="/check-up">Scopri il metodo →</CtaButton>
            <p className="text-sm text-ink-soft">
              30 min · Nessun impegno · Ti dico se fa per te
            </p>
          </div>
        </div>
      </section>

      {/* Le 3 opzioni */}
      <Section className="bg-white border-t border-hairline">

        <H2>Le tue tre opzioni oggi (e perché nessuna ti convince)</H2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {opzioni.map((o) => (
            <Card key={o.t} title={o.t}>{o.d}</Card>
          ))}
        </div>
        <p className="mt-8 text-center text-xl font-semibold text-ink">
          E se ci fosse una quarta via?
        </p>
      </Section>

      {/* La quarta via */}
      <Section>
        <div className="grid gap-10 md:grid-cols-[3fr_2fr] md:items-center">
          <div>
            <H2>Impari il metodo sulla tua posizione aperta. Vera.</H2>
            <div className="mt-6 space-y-4 text-lg text-ink-soft">
              <p>
                Nessun caso di studio finto. Prendiamo una posizione che devi
                coprire davvero, adesso, e la lavoriamo insieme a una persona della
                tua azienda — un office manager, un'assistente di direzione,
                chiunque abbia voglia di imparare.
              </p>
              <p>
                Schema semplice: prima faccio io e tu osservi. Poi facciamo insieme.
                Poi fai tu e io correggo. Alla fine:
              </p>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 -rotate-2 rounded-2xl bg-info-bg" aria-hidden />
            <div className="relative rounded-2xl border border-hairline bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
                Scorecard colloquio · esempio
              </p>
              <ul className="mt-5 space-y-4 text-sm">
                {[
                  { c: "Competenze tecniche", v: "4/5" },
                  { c: "Esperienza sul ruolo", v: "3/5" },
                  { c: "Autonomia e organizzazione", v: "5/5" },
                  { c: "Allineamento con il team", v: "4/5" },
                ].map((r) => (
                  <li key={r.c} className="flex items-center justify-between gap-4">
                    <span className="text-ink-soft">{r.c}</span>
                    <span className="display text-lg text-brand">{r.v}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
                <span className="text-sm font-semibold text-ink">Valutazione oggettiva</span>
                <span className="display text-2xl text-brand">16/20</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {risultati.map((r) => (
            <Card key={r.t} icon={<Check className="h-6 w-6" />} title={r.t}>
              {r.d}
            </Card>
          ))}
        </div>
        <div className="mt-12">
          <h3 className="mb-6 text-xl font-semibold text-ink">Il processo in 6 passi</h3>
          <ProcessTimeline />
        </div>
      </Section>

      {/* Fondi */}
      <Section className="bg-white border-t border-hairline">
        <H2>E qui viene il bello: la formazione può risultare quasi a costo zero</H2>
        <div className="mt-6 max-w-3xl space-y-4 text-lg text-ink-soft">
          <p>
            La tua azienda versa già ogni mese, in busta paga, un contributo
            dello 0,30% destinato alla formazione. Quasi nessuna PMI lo usa:
            sono soldi tuoi che restano fermi.
          </p>
          <p>
            Aderendo a un Fondo Interprofessionale (l'adesione è gratuita, si fa
            con una comunicazione all'INPS), la componente formativa del
            percorso viene finanziata da quei fondi. Risultato: paghi
            principalmente il risultato — l'assunzione fatta — mentre la
            formazione della tua persona te la copre in gran parte il fondo.
          </p>
        </div>
        <div className="mt-8 flex items-start gap-4 rounded-2xl border border-brand/30 bg-info-bg p-6">
          <Lightbulb className="mt-1 h-6 w-6 shrink-0 text-brand" />
          <p className="text-base text-ink">
            Nel check-up verifichiamo insieme, in 5 minuti, se la tua azienda ha
            già i requisiti per accedere ai fondi.
          </p>
        </div>
      </Section>

      {/* Per chi è / non è */}
      <Section>
        <H2>Parliamoci chiaro</H2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-hairline bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-ink">✅ Fa per te se:</h3>
            <ul className="space-y-3">
              {perChi.map((v) => (
                <li key={v} className="flex gap-3 text-ink-soft">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-brand" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-hairline bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-ink">❌ NON fa per te se:</h3>
            <ul className="space-y-3">
              {nonPerChi.map((v) => (
                <li key={v} className="flex gap-3 text-ink-soft">
                  <X className="mt-1 h-5 w-5 shrink-0 text-ink-soft" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
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
      <Section className="bg-ink">
        <div className="mx-auto max-w-2xl text-center">
          <H2 className="text-white">Il primo passo è capire se ha senso. Gratis.</H2>
          <p className="mt-4 text-lg text-white/70">
            30 minuti di check-up: analizziamo come assumi oggi, ti mostro come
            funzionerebbe il metodo sulla tua posizione aperta, e verifichiamo
            se puoi accedere ai fondi. Poi decidi tu.
          </p>
        </div>
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4">
          <CtaButton href="/check-up">Prenota il tuo check-up gratuito →</CtaButton>
          <p className="text-sm text-white/60">
            2 minuti di survey · Ti richiamo entro 48 ore
          </p>
        </div>
      </Section>

      <Footer />
      <StickyMobileCta />
    </main>
  );
}
