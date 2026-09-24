"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type GymSummary = {
  id: string;
  name: string;
  tier: string;
  allowsPeak: boolean;
  offPeakFillPct: number;
  upcomingCount: number;
  revenueToDate: number;
};

export default function OwnerHomePage() {
  const [gyms, setGyms] = useState<GymSummary[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        {[1, 2].map((i) => (
          <div key={i} className="mb-3 h-28 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-lg font-bold text-slate-900">Owner Dashboard</h1>

      <nav className="mt-4 flex gap-2 text-xs">
        <Link href="/owner/slots" className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200">Slots</Link>
        <Link href="/owner/bookings" className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200">Bookings</Link>
        <Link href="/owner/revenue" className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200">Revenue</Link>
      </nav>

      <div className="mt-6 space-y-4">
        {gyms.map((gym) => (
          <Card key={gym.id} className="p-5">
            <p className="text-sm font-semibold text-slate-900">{gym.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{gym.tier}</p>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-brand-600">{gym.offPeakFillPct}%</p>
                <p className="text-[10px] text-slate-400">Off-peak fill</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{gym.upcomingCount}</p>
                <p className="text-[10px] text-slate-400">Upcoming</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{gym.revenueToDate}</p>
                <p className="text-[10px] text-slate-400">Revenue (cr)</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
