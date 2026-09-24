"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge, type TimeBandVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BookingConfirmModal } from "@/components/BookingConfirmModal";
import { creditsToWonDisplay } from "@/lib/pricing";
import { StarIcon } from "@/components/icons/StarIcon";
import { createClient } from "@/lib/supabase/client";
import { useMessages } from "@/lib/useMessages";

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
  imageUrl: string | null;
  tier: string;
  activities: Activity[];
};

type FlatSlot = Slot & { activityName: string };

type Messages = {
  timeBand: Record<string, string>;
  detail: {
    bookButton: string;
    full: string;
    cancelPolicy: string;
    gymNotFound: string;
  };
};

export default function GymDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [bookingSlot, setBookingSlot] = useState<FlatSlot | null>(null);
  const t = useMessages<Messages>();

  useEffect(() => {
    fetch("/api/gyms")
      .then((r) => r.json())
      .then((gyms: Gym[]) => {
        setGym(gyms.find((g) => g.id === id) ?? null);
        setLoading(false);
      });

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetch(`/api/user?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then((u) => {
            setUserId(u.id);
            setCreditBalance(u.creditBalance);
          });
      }
    });
  }, [id]);

  function handleBooked() {
    if (!userId) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetch(`/api/user?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then((u) => setCreditBalance(u.creditBalance));
      }
    });
    fetch("/api/gyms")
      .then((r) => r.json())
      .then((gyms: Gym[]) => {
        setGym(gyms.find((g) => g.id === id) ?? null);
      });
  }

  if (loading || !t) {
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
        <p className="text-sm text-slate-400">{t.detail.gymNotFound}</p>
      </div>
    );
  }

  const allSlots: FlatSlot[] = gym.activities.flatMap((a) =>
    a.slots.map((s) => ({ ...s, activityName: a.name })),
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {gym.imageUrl && (
        <div className="mb-4 overflow-hidden rounded-xl">
          <img
            src={gym.imageUrl}
            alt={gym.name}
            className="h-48 w-full object-cover"
          />
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">{gym.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          <StarIcon className="inline h-3.5 w-3.5 text-amber-400" /> {gym.rating.toFixed(1)}
          {gym.address && ` · ${gym.address}`}
        </p>
      </div>

      <p className="mb-4 text-xs text-slate-400">
        {t.detail.cancelPolicy}
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
                    {t.timeBand[slot.timeBand]}
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
                onClick={() => !full && setBookingSlot(slot)}
              >
                {full ? t.detail.full : t.detail.bookButton}
              </Button>
            </Card>
          );
        })}
      </div>

      {bookingSlot && userId && (
        <BookingConfirmModal
          classSlot={{
            id: bookingSlot.id,
            creditCost: bookingSlot.creditCost,
            startTime: bookingSlot.startTime,
            activityName: bookingSlot.activityName,
          }}
          userId={userId}
          creditBalance={creditBalance}
          onClose={() => setBookingSlot(null)}
          onBooked={handleBooked}
        />
      )}
    </div>
  );
}
