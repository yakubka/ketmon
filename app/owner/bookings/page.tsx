"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useMessages } from "@/lib/useMessages";

type Booking = {
  id: string;
  status: string;
  creditsPaid: number;
  classSlot: {
    activity: { name: string };
    gym: { name: string };
    startTime: string;
  };
};

type Messages = {
  owner: {
    incomingBookings: string;
    noBookings: string;
  };
};

const STATUS_STYLES: Record<string, string> = {
  BOOKED: "bg-slate-100 text-slate-700",
  ATTENDED: "bg-emerald-50 text-emerald-700",
  NO_SHOW: "bg-red-50 text-red-700",
  LATE_CANCELLED: "bg-red-50 text-red-600",
  CANCELLED: "bg-slate-50 text-slate-400",
};

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useMessages<Messages>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetch(`/api/user?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then((u) => fetch(`/api/owner/bookings?ownerId=${u.id}`))
          .then((r) => r.json())
          .then((b) => {
            setBookings(b);
            setLoading(false);
          });
      }
    });
  }, []);

  if (loading || !t) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-3 h-20 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-lg font-bold text-slate-900">{t.owner.incomingBookings}</h1>

      {bookings.length === 0 && (
        <p className="mt-4 text-sm text-slate-400">{t.owner.noBookings}</p>
      )}

      <div className="mt-4 space-y-3">
        {bookings.map((b) => (
          <Card key={b.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {b.classSlot.activity.name}
              </p>
              <p className="text-xs text-slate-500">
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
          </Card>
        ))}
      </div>
    </div>
  );
}
