"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge, type TimeBandVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BookingConfirmModal } from "@/components/BookingConfirmModal";
import { WheelPicker } from "@/components/WheelPicker";
import { SportIcon } from "@/components/icons/SportIcons";
import { LocationPinIcon } from "@/components/icons/UIIcons";
import { creditsToWonDisplay } from "@/lib/pricing";
import { StarIcon } from "@/components/icons/StarIcon";
import { createClient } from "@/lib/supabase/client";
import { useMessages } from "@/lib/useMessages";
import { bandForHour } from "@/lib/time-band";
import { kstDateString } from "@/lib/kst";

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
    fitsSchedule: string;
    dropIn: string;
    pickTime: string;
    classes: string;
  };
};

function buildDays(count: number): { date: Date; iso: string }[] {
  const days = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    days.push({ date: d, iso: kstDateString(d) });
  }
  return days;
}

export default function GymDetailPage() {
  const { id } = useParams<{ id: string }>();
  const days = useMemo(() => buildDays(7), []);
  const [selectedDay, setSelectedDay] = useState(days[0].iso);
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [preferredTimeBand, setPreferredTimeBand] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState<FlatSlot | null>(null);
  const t = useMessages<Messages>();
  const locale = typeof window !== "undefined" ? localStorage.getItem("ketmon-locale") || "ko" : "ko";

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gyms/${id}?date=${selectedDay}`)
      .then((r) => r.json())
      .then((data) => {
        setGym(data.error ? null : data);
        setLoading(false);
      });
  }, [id, selectedDay]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetch(`/api/user?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then((u) => {
            setUserId(u.id);
            setCreditBalance(u.creditBalance);
            setPreferredTimeBand(u.preferredTimeBand ?? null);
          });
      }
    });
  }, []);

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
    fetch(`/api/gyms/${id}?date=${selectedDay}`)
      .then((r) => r.json())
      .then((data) => setGym(data.error ? null : data));
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

  const dropInActivities = gym.activities.filter((a) => a.sport === "gym" && a.slots.length > 0);
  const classActivities = gym.activities.filter((a) => a.sport !== "gym");

  const classSlots: FlatSlot[] = classActivities
    .flatMap((a) => a.slots.map((s) => ({ ...s, activityName: a.name })))
    .sort((a, b) => {
      if (!preferredTimeBand) return 0;
      const aFits = bandForHour(new Date(a.startTime).getHours()) === preferredTimeBand ? 1 : 0;
      const bFits = bandForHour(new Date(b.startTime).getHours()) === preferredTimeBand ? 1 : 0;
      return bFits - aFits;
    });

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
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">{gym.name}</h1>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <StarIcon className="h-3.5 w-3.5 text-amber-400" /> {gym.rating.toFixed(1)}
          {gym.address && (
            <span className="flex items-center gap-0.5">
              <LocationPinIcon className="h-3.5 w-3.5" /> {gym.address}
            </span>
          )}
        </p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {days.map((day) => {
          const active = selectedDay === day.iso;
          const dow = day.date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", { weekday: "short" });
          return (
            <button
              key={day.iso}
              onClick={() => setSelectedDay(day.iso)}
              className={`flex flex-shrink-0 flex-col items-center gap-0.5 rounded-2xl px-3.5 py-2.5 transition-colors ${
                active ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className={`text-[10px] font-medium uppercase ${active ? "text-white/80" : "text-slate-400"}`}>{dow}</span>
              <span className="text-base font-bold leading-none">{day.date.getDate()}</span>
            </button>
          );
        })}
      </div>

      <p className="mb-4 text-xs text-slate-400">{t.detail.cancelPolicy}</p>

      {dropInActivities.map((activity) => {
        const available = activity.slots.filter((s) => s.booked < s.capacity);
        const options = available.map((s) => ({
          value: s.id,
          label: `${new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${s.creditCost}cr`,
        }));

        return (
          <Card key={activity.id} className="mb-3 flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <SportIcon sport={activity.sport} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{activity.name}</p>
                <p className="text-xs text-slate-400">{t.detail.dropIn}</p>
              </div>
            </div>
            {options.length > 0 ? (
              <WheelPicker
                options={options}
                value=""
                label={t.detail.pickTime}
                onChange={(value) => {
                  const slot = available.find((s) => s.id === value);
                  if (slot) setBookingSlot({ ...slot, activityName: activity.name });
                }}
              />
            ) : (
              <span className="text-xs text-slate-300">{t.detail.full}</span>
            )}
          </Card>
        );
      })}

      {classSlots.length > 0 && (
        <>
          {dropInActivities.length > 0 && (
            <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{t.detail.classes}</p>
          )}
          <div className="space-y-3">
            {classSlots.map((slot) => {
              const time = new Date(slot.startTime).toLocaleString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const full = slot.booked >= slot.capacity;
              const fits = preferredTimeBand ? bandForHour(new Date(slot.startTime).getHours()) === preferredTimeBand : false;

              return (
                <Card key={slot.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{slot.activityName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{time}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant={slot.timeBand}>{t.timeBand[slot.timeBand]}</Badge>
                      {fits && (
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-600">
                          {t.detail.fitsSchedule}
                        </span>
                      )}
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
        </>
      )}

      {dropInActivities.length === 0 && classSlots.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400">
          No classes on this day
        </p>
      )}

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
