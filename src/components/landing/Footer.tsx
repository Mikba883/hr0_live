import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-white">
      <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-ink-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-semibold text-ink">[NOME ATTIVITÀ]</span>
            <span className="mx-2">·</span>
            <span>P.IVA [XXXXXXXXX]</span>
          </div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-brand">Privacy policy</Link>
            <Link to="/cookie" className="hover:text-brand">Cookie policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
