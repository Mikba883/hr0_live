const loghi = [
  { src: "/loghi/Accenture.png", alt: "Accenture" },
  { src: "/loghi/Intesa.png", alt: "Intesa Sanpaolo" },
  { src: "/loghi/unicredit.png", alt: "UniCredit" },
  { src: "/loghi/Generali.png", alt: "Generali" },
  { src: "/loghi/enel.png", alt: "Enel" },
  { src: "/loghi/Fiat.png", alt: "Fiat" },
  { src: "/loghi/Rai.png", alt: "Rai" },
];

export function LogoCloud({ label }: { label?: string }) {
  return (
    <div>
      {label && (
        <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">
          {label}
        </p>
      )}
      <div className="grid grid-cols-3 items-center gap-x-6 gap-y-6 sm:grid-cols-4 lg:grid-cols-7">
        {loghi.map((l) => (
          <img
            key={l.src}
            src={l.src}
            alt={l.alt}
            loading="lazy"
            className="mx-auto h-8 w-full max-w-[110px] object-contain opacity-60 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0 sm:h-9"
          />
        ))}
      </div>
    </div>
  );
}
