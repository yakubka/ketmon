type IconProps = { className?: string; active?: boolean };

const PNG_ICONS: Record<string, string> = {
  gym: "/icons/ph--barbell-thin.png",
  boxing: "/icons/fluent-emoji-high-contrast--boxing-glove.png",
  swimming: "/icons/hugeicons--swimming.png",
  yoga: "/icons/hugeicons--yoga-02.png",
  martial_arts: "/icons/material-symbols--sports-martial-arts-rounded.png",
  dance: "/icons/pinhead--person-dancing-with-sparkles.png",
  baseball: "/icons/glyphs--baseball-1-bold.png",
  crossfit: "/icons/fluent--sport-soccer-20-regular.png",
};

function PilatesGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <circle cx="6" cy="7" r="1.6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20l3-6.5 2-2.3 2.3 2.8-1.3 6M6.5 13.5l3.8-1.2 3 3.2 4.7-1.5M12 20l1.6-4.3" />
    </svg>
  );
}

function TennisGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <circle cx="10" cy="9" r="6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 3c2.5 2 2.5 10 0 12M10 3c-2.5 2-2.5 10 0 12M4.2 7.5h11.6M4.2 10.5h11.6M15 15l6 6" />
    </svg>
  );
}

function GenericSportGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4.2M12 16.8V21M3 12h4.2M16.8 12H21M12 7.2l3.2 2.3-1.2 3.7h-4l-1.2-3.7z" />
    </svg>
  );
}

const SVG_GLYPHS: Record<string, (p: IconProps) => JSX.Element> = {
  pilates: PilatesGlyph,
  tennis: TennisGlyph,
};

export function SportIcon({ sport, className, active }: { sport: string; className?: string; active?: boolean }) {
  const png = PNG_ICONS[sport];
  if (png) {
    return (
      <img
        src={png}
        alt=""
        className={`${className ?? "h-5 w-5"} object-contain ${active ? "brightness-0 invert" : ""}`}
      />
    );
  }
  const Glyph = SVG_GLYPHS[sport] ?? GenericSportGlyph;
  return <Glyph className={className ?? "h-5 w-5"} />;
}
