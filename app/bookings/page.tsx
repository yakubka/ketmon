"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useMessages } from "@/lib/useMessages";

type SlotInfo = {
  id: string;
  startTime: string;
  timeBand: string;
  creditCost: number;
  activity: { name: string };
  gym: { name: string };
};

type Booking = {
  id: string;
  status: string;
  creditsPaid: number;
  createdAt: string;
  classSlot: SlotInfo;
};

type Messages = {
  myBookings: {
    title: string;
    upcoming: string;
    past: string;
    cancel: string;
    confirmCancel: string;
    keepBooking: string;
    freeCancel: string;
    lateCancel: string;
    noUpcoming: string;
    noPast: string;
  };
};

const STATUS_STYLES: Record<string, string> = {
  BOOKED: "bg-slate-100 text-slate-700",
  ATTENDED: "bg-emerald-50 text-emerald-700",
  NO_SHOW: "bg-red-50 text-red-700",
  LATE_CANCELLED: "bg-red-50 text-red-600",
  CANCELLED: "bg-slate-50 text-slate-400",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Booking | null>(null);
  const t = useMessages<Messages>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetch(`/api/user?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then((u) => {
            setUserId(u.id);
            return fetch(`/api/bookings/list?userId=${u.id}`);
          })
          .then((r) => r.json())
          .then((b) => {
            setBookings(b);
            setLoading(false);
          });
      }
    });
  }, []);

  function hoursUntilStart(startTime: string): number {
    return (new Date(startTime).getTime() - Date.now()) / (1000 * 60 * 60);
  }

  async function handleCancel(booking: Booking) {
    setCancelling(booking.id);
    setConfirmCancel(null);
    await fetch(`/api/bookings/${booking.id}/cancel`, { method: "POST" });
    const updated = await fetch(`/api/bookings/list?userId=${userId}`).then((r) => r.json());
    setBookings(updated);
    setCancelling(null);
  }

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) => b.status === "BOOKED" && new Date(b.classSlot.startTime).getTime() > now,
  );
  const past = bookings.filter(
    (b) => b.status !== "BOOKED" || new Date(b.classSlot.startTime).getTime() <= now,
  );

  if (loading || !t) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        {[1, 2].map((i) => (
          <div key={i} className="mb-3 h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-lg font-bold text-slate-900">{t.myBookings.title}</h1>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-500">{t.myBookings.upcoming}</h2>
        {upcoming.length === 0 && (
          <p className="mt-2 text-sm text-slate-400">{t.myBookings.noUpcoming}</p>
        )}
        <div className="mt-2 space-y-3">
          {upcoming.map((b) => {
            const hrs = hoursUntilStart(b.classSlot.startTime);
            const isFree = hrs >= 6;
            return (
              <Card key={b.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{b.classSlot.gym.name}</p>
                    <p className="text-xs text-slate-500">{b.classSlot.activity.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(b.classSlot.startTime).toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[b.status]}`}>
                    {b.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className={`text-xs ${isFree ? "text-emerald-600" : "text-red-500"}`}>
                    {isFree ? t.myBookings.freeCancel : t.myBookings.lateCancel}
                  </p>
                  <Button
                    variant="ghost"
                    className="text-xs text-red-500"
                    onClick={() => setConfirmCancel(b)}
                    disabled={cancelling === b.id}
                  >
                    {cancelling === b.id ? "..." : t.myBookings.cancel}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-slate-500">{t.myBookings.past}</h2>
        {past.length === 0 && (
          <p className="mt-2 text-sm text-slate-400">{t.myBookings.noPast}</p>
        )}
        <div className="mt-2 space-y-3">
          {past.map((b) => (
            <Card key={b.id} className="p-4 opacity-80">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{b.classSlot.gym.name}</p>
                  <p className="text-xs text-slate-500">{b.classSlot.activity.name}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">{t.myBookings.cancel}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {confirmCancel.classSlot.gym.name} — {confirmCancel.classSlot.activity.name}
            </p>
            <p className={`mt-3 text-sm font-medium ${hoursUntilStart(confirmCancel.classSlot.startTime) >= 6 ? "text-emerald-600" : "text-red-500"}`}>
              {hoursUntilStart(confirmCancel.classSlot.startTime) >= 6
                ? t.myBookings.freeCancel
                : t.myBookings.lateCancel}
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" onClick={() => setConfirmCancel(null)} className="flex-1">
                {t.myBookings.keepBooking}
              </Button>
              <Button
                variant="primary"
                onClick={() => handleCancel(confirmCancel)}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {t.myBookings.confirmCancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
