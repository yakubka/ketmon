"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge, type TimeBandVariant } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { useMessages } from "@/lib/useMessages";

type Slot = {
  id: string;
  timeBand: TimeBandVariant;
  capacity: number;
  booked: number;
  creditCost: number;
  startTime: string;
};

type GymData = {
  id: string;
  name: string;
  allowsPeak: boolean;
  slots: Slot[];
};

type Messages = {
  owner: {
    slots: string;
    peakEnabled: string;
    peakOffOnly: string;
    peakSlots: string;
  };
  timeBand: Record<string, string>;
};

const BAND_ORDER: TimeBandVariant[] = ["OFF_PEAK", "STANDARD", "PEAK"];

export default function OwnerSlotsPage() {
  const [gyms, setGyms] = useState<GymData[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useMessages<Messages>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetch(`/api/user?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then((u) => fetch(`/api/owner/gyms?ownerId=${u.id}`))
          .then((r) => r.json())
          .then((g) => {
            setGyms(g);
            setLoading(false);
          });
      }
    });
  }, []);

  async function togglePeak(gymId: string, current: boolean) {
    await fetch(`/api/gyms/${gymId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowsPeak: !current }),
    });
    setGyms((prev) =>
      prev.map((g) =>
        g.id === gymId ? { ...g, allowsPeak: !current } : g,
      ),
    );
  }

  if (loading || !t) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-lg font-bold text-slate-900">{t.owner.slots}</h1>

      {gyms.map((gym) => (
        <div key={gym.id} className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">{gym.name}</p>
            <button
              onClick={() => togglePeak(gym.id, gym.allowsPeak)}
              className={`relative h-6 w-11 rounded-full transition-colors ${gym.allowsPeak ? "bg-brand" : "bg-slate-300"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${gym.allowsPeak ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {t.owner.peakSlots}: {gym.allowsPeak ? t.owner.peakEnabled : t.owner.peakOffOnly}
          </p>

          {BAND_ORDER.map((band) => {
            const bandSlots = gym.slots.filter((s) => s.timeBand === band);
            if (bandSlots.length === 0) return null;
            return (
              <div key={band} className="mt-3">
                <Badge variant={band} className="mb-2">{t.timeBand[band]}</Badge>
                <div className="space-y-1">
                  {bandSlots.map((slot) => {
                    const pct = slot.capacity > 0 ? Math.round((slot.booked / slot.capacity) * 100) : 0;
                    return (
                      <Card key={slot.id} className="flex items-center justify-between p-3">
                        <span className="text-xs text-slate-500">
                          {new Date(slot.startTime).toLocaleString([], {
                            weekday: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-20 rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full bg-brand"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {slot.booked}/{slot.capacity}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
