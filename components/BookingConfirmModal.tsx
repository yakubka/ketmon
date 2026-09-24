"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/useMessages";

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

type Messages = {
  booking: {
    confirmTitle: string;
    creditCost: string;
    balanceAfter: string;
    cancelWindowNotice: string;
    confirm: string;
    cancel: string;
    booking: string;
    booked: string;
    enjoy: string;
    calendarAdded: string;
    failed: string;
  };
};

export function BookingConfirmModal({
  classSlot,
  userId,
  creditBalance,
  onClose,
  onBooked,
}: BookingConfirmModalProps) {
  const [state, setState] = useState<"confirm" | "loading" | "success" | "error">("confirm");
  const t = useMessages<Messages>();

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

  if (!t) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        {state === "success" ? (
          <div className="text-center">
            <p className="text-lg font-bold text-brand-600">{t.booking.booked}</p>
            <p className="mt-2 text-sm text-slate-500">{t.booking.enjoy}</p>
            <p className="mt-3 text-xs text-slate-400">{t.booking.calendarAdded}</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-slate-900">{t.booking.confirmTitle}</h2>

            {classSlot.activityName && (
              <p className="mt-1 text-sm text-slate-500">{classSlot.activityName}</p>
            )}

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">{t.booking.creditCost}</span>
                <span className="font-semibold">{classSlot.creditCost} credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t.booking.balanceAfter}</span>
                <span className={`font-semibold ${canAfford ? "text-slate-900" : "text-red-500"}`}>
                  {balanceAfter} credits
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              {t.booking.cancelWindowNotice}
            </p>

            {state === "error" && (
              <p className="mt-2 text-xs text-red-500">
                {t.booking.failed}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                {t.booking.cancel}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!canAfford || state === "loading"}
                className="flex-1 !bg-teal-500 shadow-md shadow-teal-200 hover:!bg-teal-600"
              >
                {state === "loading" ? t.booking.booking : t.booking.confirm}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
