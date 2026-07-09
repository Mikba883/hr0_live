const steps = [
  "Job analysis: definisci le competenze, non «il ruolo»",
  "Sourcing: dove trovare i candidati che non rispondono agli annunci",
  "Screening con scorecard: valutazione oggettiva, non a sensazione",
  "Colloqui strutturati: domande che predicono la performance",
  "Offerta con i numeri di mercato: chiudi il candidato giusto",
  "Onboarding 30/60/90: la persona resta e rende",
];

export function ProcessTimeline() {
  return (
    <ol className="relative space-y-6 border-l-2 border-hairline pl-8">
      {steps.map((s, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
            {i + 1}
          </span>
          <p className="text-lg font-semibold text-ink">{s}</p>
        </li>
      ))}
    </ol>
  );
}
