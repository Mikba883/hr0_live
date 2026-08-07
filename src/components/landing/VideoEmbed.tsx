import { useState } from "react";
import { Play } from "lucide-react";

export function VideoEmbed({
  videoId,
  title = "Video di presentazione",
}: {
  videoId: string;
  title?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-hairline bg-ink">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Riproduci il video con audio"
          className="group absolute inset-0 h-full w-full"
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_30px_-8px_rgba(107,33,255,0.6)] transition group-hover:scale-110">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
            <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink">
              Clicca per avviare il video con audio
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
