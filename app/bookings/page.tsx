"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetch(`/api/auth/role?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then(() => {
            fetch(`/api/user?email=${encodeURIComponent(data.user!.email!)}`)
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
          });
      }
    });
  }, []);

  function hoursUntilStart(startTime: string): number {
    return (new Date(startTime).getTime() - Date.now()) / (1000 * 60 * 60);
  }

  async function handleCancel(booking: Booking) {
    setCancelling(booking.id);
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

  if (loading) {
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
      <h1 className="text-lg font-bold text-slate-900">My Bookings</h1>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-500">Upcoming</h2>
        {upcoming.length === 0 && (
          <p className="mt-2 text-sm text-slate-400">No upcoming bookings</p>
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
                    {isFree ? "Free cancel (full refund)" : "Late cancel (no refund)"}
                  </p>
                  <Button
                    variant="ghost"
                    className="text-xs text-red-500"
                    onClick={() => handleCancel(b)}
                    disabled={cancelling === b.id}
                  >
                    {cancelling === b.id ? "..." : "Cancel"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-slate-500">Past</h2>
        {past.length === 0 && (
          <p className="mt-2 text-sm text-slate-400">No past bookings</p>
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
    </div>
  );
}
