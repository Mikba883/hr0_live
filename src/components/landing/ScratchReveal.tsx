import { useEffect, useRef, useState } from "react";

export function ScratchReveal({
  value,
  label,
  revealText = "Scopri il costo",
}: {
  value: string;
  label?: string;
  revealText?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const scratchedRatio = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Fill scratch layer
    ctx.fillStyle = "#E5E7EB";
    ctx.fillRect(0, 0, width, height);

    // Add "scratch" pattern
    ctx.fillStyle = "#D1D5DB";
    for (let i = 0; i < width; i += 8) {
      ctx.fillRect(i, 0, 3, height);
    }

    // Add text on top
    ctx.save();
    ctx.fillStyle = "#6B7280";
    ctx.font = "600 14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(width / 2, height / 2);
    ctx.fillText(revealText, 0, -10);
    ctx.font = "400 12px Inter, sans-serif";
    ctx.fillText("👆 gratta qui", 0, 12);
    ctx.restore();

    const getPos = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      return { x: clientX - r.left, y: clientY - r.top };
    };

    const scratch = (e: MouseEvent | TouchEvent) => {
      if (!isScratching) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      checkRevealed();
    };

    const checkRevealed = () => {
      if (!canvas) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparent = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 128) transparent++;
      }
      const ratio = transparent / (pixels.length / 4);
      scratchedRatio.current = ratio;
      if (ratio > 0.45 && !revealed) {
        setRevealed(true);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const start = () => setIsScratching(true);
    const end = () => setIsScratching(false);

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", scratch, { passive: false });
    window.addEventListener("touchend", end);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", scratch);
      window.removeEventListener("mouseup", end);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", scratch);
      window.removeEventListener("touchend", end);
    };
  }, [revealText, revealed]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-hairline bg-white px-4 py-3 shadow-lg"
    >
      <div className="relative z-0 flex flex-col items-center justify-center text-center">
        <p className="display text-2xl text-danger">{value}</p>
        {label && <p className="text-xs text-ink-soft">{label}</p>}
      </div>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-10 cursor-grab touch-none ${
          revealed ? "pointer-events-none opacity-0 transition-opacity duration-500" : ""
        }`}
      />
    </div>
  );
}
