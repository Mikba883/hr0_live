export function AnnouncementBar({
  tag = "NEW",
  children,
}: {
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full border-b border-hairline bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-3 text-center text-xs sm:text-sm">
        <span className="rounded-sm bg-ink px-2 py-0.5 font-display text-[10px] uppercase tracking-wider text-white sm:text-xs">
          {tag}
        </span>
        <span className="font-semibold text-ink">{children}</span>
      </div>
    </div>
  );
}
