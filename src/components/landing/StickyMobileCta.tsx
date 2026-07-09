import { useEffect, useState } from "react";

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
      <a
        href="#form"
        className="block w-full rounded-md bg-brand px-4 py-3 text-center text-base font-semibold text-white"
      >
        Prenota il check-up gratuito
      </a>
    </div>
  );
}
