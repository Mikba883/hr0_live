import { type ReactNode } from "react";

export function CtaButton({
  href,
  children,
  variant = "primary",
  size = "lg",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "md" | "lg";
}) {
  const base =
    "inline-flex w-full sm:w-auto items-center justify-center rounded-full font-display uppercase tracking-wide transition-all duration-200 select-none";
  const sizes =
    size === "lg"
      ? "px-10 py-5 text-lg sm:text-xl"
      : "px-6 py-3 text-sm sm:text-base";
  const styles =
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand-dark shadow-[0_10px_30px_-10px_rgba(107,33,255,0.55)] hover:-translate-y-0.5"
      : variant === "outline"
      ? "border-2 border-brand text-brand hover:bg-brand hover:text-white"
      : "text-brand hover:text-brand-dark underline underline-offset-4";
  return (
    <a href={href} className={`${base} ${sizes} ${styles}`}>
      {children}
    </a>
  );
}
