const loghi = [
  { src: "/loghi/Accenture.png", alt: "Accenture" },
  { src: "/loghi/Intesa.png", alt: "Intesa Sanpaolo" },
  { src: "/loghi/unicredit.png", alt: "UniCredit" },
  { src: "/loghi/Generali.png", alt: "Generali" },
  { src: "/loghi/enel.png", alt: "Enel" },
  { src: "/loghi/Fiat.png", alt: "Fiat" },
  { src: "/loghi/Rai.png", alt: "Rai" },
];

export function LogoCloud({
  label,
  size = "md",
}: {
  label?: string;
  size?: "md" | "lg";
}) {
  const sizeClasses =
    size === "lg"
      ? "h-12 sm:h-16 max-w-[180px]"
      : "h-8 sm:h-9 max-w-[110px]";

  return (
    <div className="rounded-2xl border border-hairline bg-white p-6 sm:p-8">
      {label && (
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">
          {label}
        </p>
      )}
      <div className="group overflow-hidden">
        <div className="logo-scroll flex w-max items-center gap-x-12 sm:gap-x-16 hover:[animation-play-state:paused]">
          {[...loghi, ...loghi].map((l, i) => (
            <img
              key={`${l.src}-${i}`}
              src={l.src}
              alt={l.alt}
              loading="lazy"
              className={`w-full flex-shrink-0 object-contain opacity-60 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0 ${sizeClasses}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
