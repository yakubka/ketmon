const cls = "h-5 w-5";

type IconProps = { className?: string };

function GymGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12h2M19.5 12h2M6 8v8M18 8v8M4.5 10v4M19.5 10v4M6 12h12" />
    </svg>
  );
}

function YogaGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <circle cx="12" cy="4.5" r="1.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4.5M12 9c-2.2 0-3.6 1.6-4.5 3.4M12 9c2.2 0 3.6 1.6 4.5 3.4M12 13.5c-1.6 1.6-2 3.6-1.4 5.8M12 13.5c1.6 1.6 2 3.6 1.4 5.8M8.5 19.5c1-.6 2.2-.9 3.5-.9s2.5.3 3.5.9" />
    </svg>
  );
}

function PilatesGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <circle cx="6" cy="7" r="1.6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20l3-6.5 2-2.3 2.3 2.8-1.3 6M6.5 13.5l3.8-1.2 3 3.2 4.7-1.5M12 20l1.6-4.3" />
    </svg>
  );
}

function BoxingGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12V8a2.5 2.5 0 015 0M12 12V7a2.5 2.5 0 015 0v7c0 3.3-2 6-5.5 6-2.8 0-4.5-1.3-5.7-3.3L4 12.6c-.5-.8-.2-1.8.6-2.2.7-.4 1.6-.2 2.1.5L7 12" />
    </svg>
  );
}

function SwimmingGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.7 6.9L15 16c-2.2 0-2.8-1.1-5.1-2.3-1.8-.9-4.3-.8-5.1-.6L7.9 11c.3-.2.5-.3.5-.5.1-.2 0-.3-.2-.7l-.4-1c-.2-.4-.2-.6-.4-.7a1 1 0 00-.2-.2c-.2-.1-.4-.1-.8-.2L3.2 7c-.7-.1-1.2-.8-1-1.6.1-.8.9-1.3 1.6-1.2l4.4.6c.8.1 1.2.2 1.5.4.1.1.3.2.4.3.3.2.5.6.8 1.3" />
      <circle cx="19" cy="10" r="2.2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 18.1c1.1-3.5 5.8-1.9 9.5 0 3.7 1.9 7.5 3.1 9.5 0" />
    </svg>
  );
}

function DanceGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <circle cx="14" cy="4.5" r="1.6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 8l-3.5 1.5L7 7M13 8l1 4-3.5 3-1 5M13 8l3 2 2.5-1M14 12l3 1.5-1 4.5" />
    </svg>
  );
}

function CrossfitGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10M20 7v10M4 12h2M18 12h2M8 5v14M16 5v14M8 12h8" />
    </svg>
  );
}

function MartialArtsGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <circle cx="9" cy="4.5" r="1.6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8l-1 4 2.5 2 5.5-2M8 12l-3.5 2M11 14l1 6M11 14l4.5 1.5 3-4" />
    </svg>
  );
}

function TennisGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <circle cx="10" cy="9" r="6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 3c2.5 2 2.5 10 0 12M10 3c-2.5 2-2.5 10 0 12M4.2 7.5h11.6M4.2 10.5h11.6M15 15l6 6" />
    </svg>
  );
}

function GenericSportGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4.2M12 16.8V21M3 12h4.2M16.8 12H21M12 7.2l3.2 2.3-1.2 3.7h-4l-1.2-3.7z" />
    </svg>
  );
}

const SPORT_GLYPHS: Record<string, (p: IconProps) => JSX.Element> = {
  gym: GymGlyph,
  yoga: YogaGlyph,
  pilates: PilatesGlyph,
  boxing: BoxingGlyph,
  swimming: SwimmingGlyph,
  dance: DanceGlyph,
  crossfit: CrossfitGlyph,
  martial_arts: MartialArtsGlyph,
  tennis: TennisGlyph,
};

export function SportIcon({ sport, className }: { sport: string; className?: string }) {
  const Glyph = SPORT_GLYPHS[sport] ?? GenericSportGlyph;
  return <Glyph className={className} />;
}
