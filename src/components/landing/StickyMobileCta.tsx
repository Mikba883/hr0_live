import { useEffect, useState } from "react";

import { trackCtaClick } from "@/lib/analytics";

export function StickyMobileCta({ heroId = "hero" }: { heroId?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [heroId]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white p-3 shadow-lg transition-transform md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/*
        La barra fissa del telefono ha lo stesso testo del pulsante dell'hero
        ma è tutta un'altra cosa: compare solo su mobile e solo dopo che l'hero
        è uscito di scena. Senza la `variante` i due click finirebbero nella
        stessa riga e non sapresti quale dei due porta le richieste.
      */}
      <a
        href="/check-up"
        className="block w-full rounded-full bg-brand px-4 py-3 text-center text-base font-semibold text-white"
        data-track="manual"
        onClick={() =>
          trackCtaClick({
            etichetta: "Prenota il check-up gratuito",
            destinazione: "/check-up",
            variante: "sticky-mobile",
          })
        }
      >
        Prenota il check-up gratuito
      </a>
    </div>
  );
}
