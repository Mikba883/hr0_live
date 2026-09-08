import { type ReactNode } from "react";

import { trackCtaClick } from "@/lib/analytics";

export function CtaButton({
  href,
  children,
  variant = "primary",
  size = "lg",
  nome,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "md" | "lg";
  /**
   * Come chiamare questo pulsante nei report. Serve solo quando l'etichetta
   * non è testo semplice: negli altri casi si usa quella, che è già la cosa
   * più riconoscibile quando riguarderai i dati fra sei mesi.
   */
  nome?: string;
}) {
  const base =
    "inline-flex w-full sm:w-auto items-center justify-center rounded-full font-semibold transition-all duration-200 select-none";
  const sizes =
    size === "lg"
      ? "px-8 py-4 text-base sm:text-lg"
      : "px-6 py-3 text-sm sm:text-base";
  const styles =
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand-dark shadow-[0_6px_20px_-8px_rgba(107,33,255,0.4)] hover:-translate-y-0.5"
      : variant === "outline"
      ? "border-2 border-brand text-brand hover:bg-brand hover:text-white"
      : "text-brand hover:text-brand-dark underline underline-offset-4";
  const etichetta = nome ?? (typeof children === "string" ? children : href);

  return (
    <a
      href={href}
      className={`${base} ${sizes} ${styles}`}
      data-track="manual"
      onClick={() => trackCtaClick({ etichetta, destinazione: href, variante: variant })}
    >
      {children}
    </a>
  );
}

/**
 * CTA testuale dentro una frase — la barra annunci, una nota a piè di sezione.
 *
 * Graficamente è un link qualunque, ma porta al check-up esattamente come il
 * pulsante grande: se finisse fra i click generici non lo troveresti mai nel
 * report delle CTA, che è dove lo cercherai.
 */
export function CtaLink({
  href,
  children,
  className,
  nome,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  nome?: string;
}) {
  const etichetta = nome ?? (typeof children === "string" ? children : href);

  return (
    <a
      href={href}
      className={className}
      data-track="manual"
      onClick={() => trackCtaClick({ etichetta, destinazione: href, variante: "inline" })}
    >
      {children}
    </a>
  );
}
