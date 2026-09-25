"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge, type TimeBandVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BookingConfirmModal } from "@/components/BookingConfirmModal";
import { WheelPicker } from "@/components/WheelPicker";
import { GymImage } from "@/components/GymImage";
import { GymDetailsInfo } from "@/components/GymDetailsInfo";
import { GymPhotoCarousel } from "@/components/GymPhotoCarousel";
import { GymReviews } from "@/components/GymReviews";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { SportIcon } from "@/components/icons/SportIcons";
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

type SubscriptionPlan = {
  id: string;
  months: number;
  price: number;
  discountPct: number;
};

type Gym = {
  id: string;
  name: string;
  rating: number;
  address: string | null;
  imageUrl: string | null;
  images: string[];
  opensAt: string | null;
  closesAt: string | null;
  hasTrainer: boolean;
  trainerFee: number | null;
  hasParking: boolean;
  offersSubscription: boolean;
  subscriptionPlans: SubscriptionPlan[];
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
    credits: string;
    noClassesOnDay: string;
    slotsTab: string;
    subscribeTab: string;
    sessions: string;
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
  const [tab, setTab] = useState<"slots" | "subscribe">("slots");
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
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
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
  const classActivities = gym.activities
    .filter((a) => a.sport !== "gym" && a.slots.length > 0)
    .map((a) => ({
      ...a,
      slots: [...a.slots].sort((x, y) => {
        if (!preferredTimeBand) return 0;
        const xFits = bandForHour(new Date(x.startTime).getHours()) === preferredTimeBand ? 1 : 0;
        const yFits = bandForHour(new Date(y.startTime).getHours()) === preferredTimeBand ? 1 : 0;
        return yFits - xFits;
      }),
    }));
  const gymImages = gym.images.length > 0 ? gym.images : gym.imageUrl ? [gym.imageUrl] : [];
  const WHEEL_THRESHOLD = 3;

  const showingSubscriptions = gym.offersSubscription && tab === "subscribe";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-24">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-5">
          {gymImages.length > 0 ? (
            <GymPhotoCarousel images={gymImages} className="aspect-square w-full" />
          ) : (
            <GymImage
              src={gym.imageUrl}
              alt={gym.name}
              sport={gym.activities[0]?.sport ?? "gym"}
              className="aspect-square h-full w-full rounded-2xl object-cover"
            />
          )}

          <div>
            <h1 className="text-xl font-bold text-slate-900">{gym.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <StarIcon className="h-3.5 w-3.5 text-amber-400" /> {gym.rating.toFixed(1)}
            </p>
          </div>

          <GymDetailsInfo
            address={gym.address}
            opensAt={gym.opensAt}
            closesAt={gym.closesAt}
            hasTrainer={gym.hasTrainer}
            trainerFee={gym.trainerFee}
            hasParking={gym.hasParking}
          />

          <GymReviews gymId={gym.id} />
        </div>

        <div>
          {gym.offersSubscription && (
            <div className="mb-4 inline-flex rounded-full bg-slate-100 p-1">
              <button
                onClick={() => setTab("slots")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  tab === "slots" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.detail.slotsTab}
              </button>
              <button
                onClick={() => setTab("subscribe")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  tab === "subscribe" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.detail.subscribeTab}
              </button>
            </div>
          )}

          {showingSubscriptions ? (
            <SubscriptionPlans plans={gym.subscriptionPlans} gymName={gym.name} />
          ) : (
            <>
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

              {dropInActivities.length === 0 && classActivities.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">{t.detail.noClassesOnDay}</p>
              ) : (
                <div className="space-y-5">
                  {dropInActivities.map((activity) => {
                    const available = activity.slots.filter((s) => s.booked < s.capacity);
                    const options = available.map((s) => ({
                      value: s.id,
                      label: new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    }));

                    return (
                      <div key={activity.id}>
                        <div className="mb-2 flex items-center gap-1.5">
                          <SportIcon sport={activity.sport} className="h-3.5 w-3.5 text-teal-600" />
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{activity.name}</p>
                        </div>
                        <Card className="flex items-center justify-between gap-3 p-3">
                          <span className="text-xs text-slate-500">{t.detail.dropIn}</span>
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
                      </div>
                    );
                  })}

                  {classActivities.map((activity) => {
                    const useWheel = activity.slots.length > WHEEL_THRESHOLD;
                    const available = activity.slots.filter((s) => s.booked < s.capacity);
                    const options = available.map((s) => ({
                      value: s.id,
                      label: new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    }));

                    return (
                      <div key={activity.id}>
                        <div className="mb-2 flex items-center gap-1.5">
                          <SportIcon sport={activity.sport} className="h-3.5 w-3.5 text-teal-600" />
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{activity.name}</p>
                        </div>

                        {useWheel ? (
                          <Card className="flex items-center justify-between gap-3 p-3">
                            <span className="text-xs text-slate-500">{activity.slots.length} {t.detail.sessions}</span>
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
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {activity.slots.map((slot) => {
                              const time = new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                              const full = slot.booked >= slot.capacity;
                              const fits = preferredTimeBand ? bandForHour(new Date(slot.startTime).getHours()) === preferredTimeBand : false;

                              return (
                                <Card key={slot.id} className="flex flex-col gap-2 p-3">
                                  <p className="text-xs font-semibold text-slate-900">{time}</p>
                                  <div className="flex flex-wrap items-center gap-1">
                                    <Badge variant={slot.timeBand} className="!text-[9px]">{t.timeBand[slot.timeBand]}</Badge>
                                    {fits && (
                                      <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[9px] font-semibold text-teal-600">
                                        {t.detail.fitsSchedule}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-auto flex items-center justify-between pt-1">
                                    <span className="text-xs font-semibold text-brand-700">
                                      {slot.creditCost} {t.detail.credits}
                                    </span>
                                    <Button
                                      variant={full ? "ghost" : "primary"}
                                      disabled={full}
                                      className="px-2.5 py-1 text-[10px]"
                                      onClick={() => !full && setBookingSlot({ ...slot, activityName: activity.name })}
                                    >
                                      {full ? t.detail.full : t.detail.bookButton}
                                    </Button>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
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
