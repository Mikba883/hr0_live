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
    <section id={id} className={`px-5 py-16 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
      {children}
    </h2>
  );
}
