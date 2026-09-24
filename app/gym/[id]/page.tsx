"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge, type TimeBandVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { creditsToWonDisplay } from "@/lib/pricing";

type Slot = {
  id: string;
  startTime: string;
  timeBand: TimeBandVariant;
  creditCost: number;
  capacity: number;
  booked: number;
};

type Activity = {
  id: string;
  name: string;
  sport: string;
  slots: Slot[];
};

type Gym = {
  id: string;
  name: string;
  rating: number;
  address: string | null;
  tier: string;
  activities: Activity[];
};

const BAND_LABELS: Record<string, string> = {
  OFF_PEAK: "Off-peak",
  STANDARD: "Standard",
  PEAK: "Peak",
};

export default function GymDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gyms")
      .then((r) => r.json())
      .then((gyms: Gym[]) => {
        setGym(gyms.find((g) => g.id === id) ?? null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-400">Gym not found</p>
      </div>
    );
  }

  const allSlots = gym.activities.flatMap((a) =>
    a.slots.map((s) => ({ ...s, activityName: a.name })),
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">{gym.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          &#9733; {gym.rating.toFixed(1)}
          {gym.address && ` · ${gym.address}`}
        </p>
      </div>

      <p className="mb-4 text-xs text-slate-400">
        Free cancellation up to 6 hours before class
      </p>

      <div className="space-y-3">
        {allSlots.map((slot) => {
          const time = new Date(slot.startTime).toLocaleString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          const full = slot.booked >= slot.capacity;

          return (
            <Card key={slot.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {slot.activityName}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{time}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={slot.timeBand}>
                    {BAND_LABELS[slot.timeBand]}
                  </Badge>
                  <span className="text-xs font-semibold text-brand-700">
                    {slot.creditCost} credits
                  </span>
                  <span className="text-[10px] text-slate-300">
                    (~&#8361;{creditsToWonDisplay(slot.creditCost).toLocaleString()})
                  </span>
                </div>
              </div>
              <Button
                variant={full ? "ghost" : "primary"}
                disabled={full}
                className="text-xs"
              >
                {full ? "Full" : "Book"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
