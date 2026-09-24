"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DEMO_MEMBER_EMAIL = "demo.member@ketmon.app";
const DEMO_OWNER_EMAIL = "demo.owner@ketmon.app";

type Booking = {
  id: string;
  status: string;
  creditsPaid: number;
  classSlot: {
    activity: { name: string };
    gym: { id: string; name: string };
    startTime: string;
  };
};

type DemoResult = {
  text: string;
  type: "success" | "error";
};

export function DemoPanel() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [results, setResults] = useState<Record<string, DemoResult>>({});
  const [convertResult, setConvertResult] = useState<DemoResult | null>(null);
  const [selectedGymId, setSelectedGymId] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (email === DEMO_MEMBER_EMAIL || email === DEMO_OWNER_EMAIL) {
        setVisible(true);
        fetch(`/api/user?email=${encodeURIComponent(email)}`)
          .then((r) => r.json())
          .then((u) => {
            setUserId(u.id);
            return fetch(`/api/bookings/list?userId=${u.id}`);
          })
          .then((r) => r.json())
          .then((b) => setBookings(b));
      }
    });
  }, []);

  if (!visible) return null;

  async function markBooking(bookingId: string, action: "ATTEND" | "NO_SHOW") {
    const res = await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, bookingId }),
    });
    const data = await res.json();
    if (res.ok) {
      setResults((prev) => ({
        ...prev,
        [bookingId]: {
          text: action === "ATTEND"
            ? `Attended — gym paid ${data.gymPaid} cr`
            : `No-show — gym compensated ${data.gymPaid} cr`,
          type: "success",
        },
      }));
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: data.booking.status } : b,
        ),
      );
    } else {
      setResults((prev) => ({
        ...prev,
        [bookingId]: { text: "Failed", type: "error" },
      }));
    }
  }

  async function triggerConvert() {
    if (!userId || !selectedGymId) return;
    const res = await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CONVERT", userId, gymId: selectedGymId }),
    });
    const data = await res.json();
    if (res.ok) {
      setConvertResult({
        text: `Commission: ₩${data.commission.amount.toLocaleString()}`,
        type: "success",
      });
    } else {
      setConvertResult({ text: "Failed", type: "error" });
    }
  }

  const gymIds = [...new Set(bookings.map((b) => b.classSlot.gym.id))];
  const gymNames: Record<string, string> = {};
  for (const b of bookings) gymNames[b.classSlot.gym.id] = b.classSlot.gym.name;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-slate-800 px-3 py-2 text-xs font-bold text-yellow-400 shadow-lg"
      >
        DEMO
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200 shadow-2xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
          Demo Panel
        </span>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
          X
        </button>
      </div>

      <div className="mt-3 max-h-60 space-y-2 overflow-y-auto">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-lg bg-slate-800 p-2">
            <p className="text-xs">
              {b.classSlot.activity.name} @ {b.classSlot.gym.name}
            </p>
            <p className="text-[10px] text-slate-400">
              {new Date(b.classSlot.startTime).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" · "}
              {b.status}
            </p>
            {b.status === "BOOKED" && (
              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => markBooking(b.id, "ATTEND")}
                  className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] text-white hover:bg-emerald-500"
                >
                  Attended
                </button>
                <button
                  onClick={() => markBooking(b.id, "NO_SHOW")}
                  className="rounded bg-red-600 px-2 py-0.5 text-[10px] text-white hover:bg-red-500"
                >
                  No-show
                </button>
              </div>
            )}
            {results[b.id] && (
              <p className={`mt-1 text-[10px] ${results[b.id].type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                {results[b.id].text}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-slate-700 pt-3">
        <p className="text-xs text-slate-400">Convert to membership</p>
        <div className="mt-1 flex gap-2">
          <select
            value={selectedGymId}
            onChange={(e) => setSelectedGymId(e.target.value)}
            className="flex-1 rounded bg-slate-800 px-2 py-1 text-xs text-slate-200"
          >
            <option value="">Select gym</option>
            {gymIds.map((id) => (
              <option key={id} value={id}>{gymNames[id]}</option>
            ))}
          </select>
          <button
            onClick={triggerConvert}
            disabled={!selectedGymId}
            className="rounded bg-brand-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-brand-500 disabled:opacity-40"
          >
            Convert
          </button>
        </div>
        {convertResult && (
          <p className={`mt-1 text-[10px] ${convertResult.type === "success" ? "text-brand-400" : "text-red-400"}`}>
            {convertResult.text}
          </p>
        )}
      </div>
    </div>
  );
}
