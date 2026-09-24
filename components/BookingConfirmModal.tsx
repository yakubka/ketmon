"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { creditsToWonDisplay } from "@/lib/pricing";

interface BookingConfirmModalProps {
  classSlot: {
    id: string;
    creditCost: number;
    startTime: string;
    activityName?: string;
  };
  userId: string;
  creditBalance: number;
  onClose: () => void;
  onBooked: () => void;
}

export function BookingConfirmModal({
  classSlot,
  userId,
  creditBalance,
  onClose,
  onBooked,
}: BookingConfirmModalProps) {
  const [state, setState] = useState<"confirm" | "loading" | "success" | "error">("confirm");

  const balanceAfter = creditBalance - classSlot.creditCost;
  const canAfford = balanceAfter >= 0;

  async function handleConfirm() {
    setState("loading");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, classSlotId: classSlot.id }),
      });
      if (!res.ok) throw new Error();
      setState("success");
      setTimeout(() => {
        onBooked();
        onClose();
      }, 1500);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        {state === "success" ? (
          <div className="text-center">
            <p className="text-lg font-bold text-brand-600">Booked</p>
            <p className="mt-2 text-sm text-slate-500">Enjoy your class</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-slate-900">Confirm booking</h2>

            {classSlot.activityName && (
              <p className="mt-1 text-sm text-slate-500">{classSlot.activityName}</p>
            )}

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Credit cost</span>
                <span className="font-semibold">
                  {classSlot.creditCost} credits
                  <span className="ml-1 text-xs text-slate-400">
                    (~&#8361;{creditsToWonDisplay(classSlot.creditCost).toLocaleString()})
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Balance after</span>
                <span className={`font-semibold ${canAfford ? "text-slate-900" : "text-red-500"}`}>
                  {balanceAfter} credits
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Free cancellation up to 6 hours before class
            </p>

            {state === "error" && (
              <p className="mt-2 text-xs text-red-500">
                Booking failed. Please try again.
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!canAfford || state === "loading"}
                className="flex-1"
              >
                {state === "loading" ? "Booking..." : "Confirm"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
