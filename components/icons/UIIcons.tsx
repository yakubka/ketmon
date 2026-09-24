const cls = "h-5 w-5";

type IconProps = { className?: string };

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function SlidersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <path strokeLinecap="round" d="M4 6h10M17 6h3M4 12h3M10 12h10M4 18h13M20 18h0" />
      <circle cx="14" cy="6" r="2" />
      <circle cx="7" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function SunriseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v3M4.2 11H2M22 11h-2.2M5.6 6.6l1.5 1.5M18.4 6.6l-1.5 1.5M5 17h14M7 17a5 5 0 0110 0" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path strokeLinecap="round" d="M12 2.5v2.3M12 19.2v2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
    </svg>
  );
}

export function SunsetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10V7M4.2 13H2M22 13h-2.2M5.6 8.6l1.5 1.5M18.4 8.6l-1.5 1.5M5 17h14M7 17a5 5 0 0110 0M3 21h18" />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 14.7A8.5 8.5 0 1110 3.3a6.8 6.8 0 1010.5 11.4z" />
    </svg>
  );
}

export function LocationPinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? cls} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}
