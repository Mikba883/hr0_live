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
    <div className="rounded-lg border border-hairline bg-white p-6">
      {icon && <div className="mb-4 text-brand">{icon}</div>}
      {title && <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>}
      <div className="text-ink-soft">{children}</div>
    </div>
  );
}
