import { type ReactNode } from "react";

export function Card({
  title,
  children,
  icon,
  highlight = false,
}: {
  title?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl border-2 border-brand bg-info-bg p-7 shadow-[0_20px_50px_-25px_rgba(107,33,255,0.45)]"
          : "rounded-2xl border border-hairline bg-white p-7 transition-all hover:border-brand/40 hover:shadow-[0_20px_50px_-25px_rgba(11,18,32,0.25)]"
      }
    >
      {icon && (
        <div
          className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
            highlight ? "bg-brand text-white" : "bg-info-bg text-brand"
          } [&_svg]:h-7 [&_svg]:w-7`}
        >
          {icon}
        </div>
      )}
      {title && (
        <h3 className="mb-3 text-lg font-semibold tracking-tight text-ink">{title}</h3>
      )}
      <div className="text-base leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}
