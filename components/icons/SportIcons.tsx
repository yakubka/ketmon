type IconProps = { className?: string; active?: boolean };

const PNG_ICONS: Record<string, string> = {
  gym: "/icons/ph--barbell-thin.png",
  boxing: "/icons/fluent-emoji-high-contrast--boxing-glove.png",
  swimming: "/icons/hugeicons--swimming.png",
  yoga: "/icons/hugeicons--yoga-02.png",
  martial_arts: "/icons/material-symbols--sports-martial-arts-rounded.png",
  dance: "/icons/pinhead--person-dancing-with-sparkles.png",
  baseball: "/icons/glyphs--baseball-1-bold.png",
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
      <ellipse cx="10" cy="8.5" rx="6" ry="7" />
      <path strokeLinecap="round" d="M6 4.5v8M8 3.3v10.4M10 3v11M12 3.3v10.4M14 4.5v8M4.3 6h11.4M4.3 8.5h11.4M4.3 11h11.4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 15.3v3M8.3 21h3.4l-.8-2.7h-1.8z" />
    </svg>
  );
}

function CrossfitGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8v8M3 10v4M8 5v14M6.5 8v8M17.5 8v8M16 5v14M21 10v4M20 8v8M8 12h8" />
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
  crossfit: CrossfitGlyph,
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
