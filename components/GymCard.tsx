"use client";

import { Card } from "@/components/ui/Card";
import { Badge, type TimeBandVariant } from "@/components/ui/Badge";
import { StarIcon } from "@/components/icons/StarIcon";
import { creditsToWonDisplay } from "@/lib/pricing";
import Link from "next/link";

interface GymCardProps {
  gymId: string;
  gymName: string;
  activityName: string;
  distanceKm: number;
  rating: number;
  timeBand: TimeBandVariant;
  creditCost: number;
  startTime: string;
  timeBandLabel: string;
  imageUrl?: string | null;
}

export function GymCard({
  gymId,
  gymName,
  activityName,
  distanceKm,
  rating,
  timeBand,
  creditCost,
  startTime,
  timeBandLabel,
  imageUrl,
}: GymCardProps) {
  const wonDisplay = creditsToWonDisplay(creditCost).toLocaleString();
  const time = new Date(startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link href={`/gym/${gymId}`}>
      <Card className="cursor-pointer overflow-hidden">
        <div className="flex">
          {imageUrl && (
            <div className="h-24 w-24 flex-shrink-0">
              <img
                src={imageUrl}
                alt={gymName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {gymName}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{activityName}</p>
              </div>
              <Badge variant={timeBand}>{timeBandLabel}</Badge>
            </div>

            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <span>{distanceKm.toFixed(1)} km</span>
              <span className="inline-flex items-center gap-0.5">
                <StarIcon className="h-3 w-3 text-amber-400" />
                {rating.toFixed(1)}
              </span>
              <span>{time}</span>
            </div>

            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-brand-700">
                {creditCost}
              </span>
              <span className="text-xs text-slate-400">credits</span>
              <span className="text-[10px] text-slate-300">
                (~&#8361;{wonDisplay})
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
