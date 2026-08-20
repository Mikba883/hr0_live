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
      ? "h-10 sm:h-12 max-w-[150px]"
      : "h-8 sm:h-9 max-w-[110px]";

  return (
    <div className="rounded-2xl border border-hairline bg-white p-6 sm:p-8">
      {label && (
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">
          {label}
        </p>
      )}
      <div className="grid grid-cols-3 items-center gap-x-8 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
        {loghi.map((l) => (
          <img
            key={l.src}
            src={l.src}
            alt={l.alt}
            loading="lazy"
            className={`mx-auto w-full object-contain opacity-60 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0 ${sizeClasses}`}
          />
        ))}
      </div>
    </div>
  );
}
