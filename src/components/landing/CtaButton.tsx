import { type ReactNode } from "react";

export function CtaButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const base =
    "inline-flex w-full sm:w-auto items-center justify-center rounded-md px-6 py-4 text-base font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand-dark"
      : "text-brand hover:text-brand-dark underline underline-offset-4";
  return (
    <a href={href} className={`${base} ${styles}`}>
      {children}
    </a>
  );
}
