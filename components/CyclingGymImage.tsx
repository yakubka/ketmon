"use client";

import { useRef, useState } from "react";
import { SportIcon } from "@/components/icons/SportIcons";

export function CyclingGymImage({
  images,
  fallbackSrc,
  alt,
  sport,
  className,
}: {
  images: string[];
  fallbackSrc: string | null;
  alt: string;
  sport: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const timer = useRef<ReturnType<typeof setInterval>>();

  const pool = images.length > 0 ? images : fallbackSrc ? [fallbackSrc] : [];
  const usable = pool.filter((_, i) => !broken[i]);
  const src = usable[index % Math.max(usable.length, 1)];

  function start() {
    if (pool.length <= 1) return;
    timer.current = setInterval(() => {
      setIndex((i) => i + 1);
    }, 700);
  }

  function stop() {
    if (timer.current) clearInterval(timer.current);
    setIndex(0);
  }

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 ${className ?? ""}`}>
        <SportIcon sport={sport} className="h-7 w-7 text-teal-500" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onMouseEnter={start}
      onMouseLeave={stop}
      onError={() => setBroken((b) => ({ ...b, [index % pool.length]: true }))}
      className={className}
    />
  );
}
