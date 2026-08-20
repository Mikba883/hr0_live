import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function BlurReveal({
  value = "18.000€",
  to = "/costo",
  hash = "calcolatore",
}: {
  value?: string;
  to?: string;
  hash?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Link
      to={to}
      hash={hash}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onTouchStart={() => setRevealed(true)}
      onFocus={() => setRevealed(true)}
      onBlur={() => setRevealed(false)}
      className="group block rounded-2xl border border-hairline bg-white p-5 shadow-[0_10px_30px_-12px_rgba(16,16,24,0.25)] transition-transform duration-300 hover:-translate-y-1"
      aria-label="Scopri il tuo costo nascosto e vai al calcolatore"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
        Scopri il tuo costo nascosto
      </p>

      <div className="relative mt-2 overflow-hidden">
        <p
          className={`text-[38px] font-black leading-none text-ink transition-all duration-500 ${
            revealed ? "blur-0 opacity-100 scale-100" : "blur-[10px] opacity-70 scale-[1.04] select-none"
          }`}
        >
          {value}
        </p>
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            revealed ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="rounded-full bg-ink/90 px-3 py-1 text-[11px] font-semibold text-white">
            Passa il mouse
          </span>
        </div>
      </div>

      <span
        className={`mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand transition-all duration-300 ${
          revealed ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
        }`}
      >
        Calcola il tuo <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
