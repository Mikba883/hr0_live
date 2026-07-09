import { type ReactNode } from "react";

export function Card({
  title,
  children,
  icon,
}: {
  title?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-7 transition-all hover:border-brand/40 hover:shadow-[0_20px_50px_-25px_rgba(11,18,32,0.25)]">
      {icon && <div className="mb-4 text-brand">{icon}</div>}
      {title && (
        <h3 className="mb-3 font-display text-lg uppercase tracking-tight text-ink">
          {title}
        </h3>
      )}
      <div className="text-base leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}
