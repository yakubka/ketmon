"use client";

import { useState } from "react";
import { SportIcon } from "@/components/icons/SportIcons";

export function GymImage({
  src,
  alt,
  sport,
  className,
}: {
  src: string | null;
  alt: string;
  sport: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
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
      onError={() => setBroken(true)}
      className={className}
    />
  );
}
