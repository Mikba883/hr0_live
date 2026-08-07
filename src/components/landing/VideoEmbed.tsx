import { useRef, useState } from "react";
import { Play } from "lucide-react";

export function VideoEmbed({
  videoId,
  title = "Video di presentazione",
}: {
  videoId: string;
  title?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggle = () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      JSON.stringify({
        event: "command",
        func: paused ? "playVideo" : "pauseVideo",
        args: [],
      }),
      "*",
    );
    setPaused((p) => !p);
  };

  const src =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?autoplay=1&controls=0&rel=0&modestbranding=1&iv_load_policy=3` +
    `&disablekb=1&fs=0&playsinline=1&enablejsapi=1`;

  return (
    <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-hairline bg-ink">
      {playing ? (
        <>
          <iframe
            ref={iframeRef}
            className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02]"
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          <button
            type="button"
            onClick={toggle}
            aria-label={paused ? "Riprendi il video" : "Metti in pausa"}
            className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
          >
            {paused && (
              <span className="absolute inset-0 flex items-center justify-center bg-ink/40">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white">
                  <Play className="ml-1 h-9 w-9 fill-current" />
                </span>
              </span>
            )}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Riproduci il video con audio"
          className="group absolute inset-0 h-full w-full"
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="h-full w-full scale-[1.35] object-cover opacity-80 transition group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand text-white shadow-[0_16px_40px_-10px_rgba(107,33,255,0.7)] transition group-hover:scale-110 sm:h-28 sm:w-28">
              <Play className="ml-1 h-11 w-11 fill-current sm:h-12 sm:w-12" />
            </span>
            <span className="rounded-full bg-white px-7 py-4 text-base font-bold text-ink shadow-lg transition group-hover:scale-105 sm:text-lg">
              Clicca qui per avviare il video con audio
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
