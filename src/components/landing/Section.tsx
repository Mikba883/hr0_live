import { type ReactNode } from "react";

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-5 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

export function H2({
  children,
  className = "text-ink",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-[30px] leading-[1.1] sm:text-[40px] ${className}`}>
      {children}
    </h2>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand">
      {children}
    </p>
  );
}
