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
  return (
    <a href={href} className={`${base} ${sizes} ${styles}`}>
      {children}
    </a>
  );
}
