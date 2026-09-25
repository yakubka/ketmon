"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/useMessages";

type Plan = {
  id: string;
  months: number;
  price: number;
  discountPct: number;
};

type Messages = {
  subscription: {
    month: string;
    months: string;
    perMonth: string;
    save: string;
    subscribe: string;
    confirmTitle: string;
    confirmBody: string;
    confirm: string;
    cancel: string;
    subscribed: string;
    enjoy: string;
    failed: string;
    alreadySubscribed: string;
  };
};

export function SubscriptionPlans({
  plans,
  gymName,
  userId,
}: {
  plans: Plan[];
  gymName: string;
  userId: string | null;
}) {
  const [selected, setSelected] = useState<Plan | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const t = useMessages<Messages>();

  if (!t || plans.length === 0) return null;

  async function handleConfirm() {
    if (!selected || !userId) return;
    setSubmitting(true);
    setErrorCode(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planId: selected.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorCode(data.error ?? "FAILED");
        return;
      }
      setConfirmed(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2.5">
      {plans.map((plan) => {
        const perMonth = Math.round(plan.price / plan.months);
        return (
          <div
            key={plan.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-teal-300"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">
                  {plan.months} {plan.months === 1 ? t.subscription.month : t.subscription.months}
                </p>
                {plan.discountPct > 0 && (
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-600">
                    -{plan.discountPct}% {t.subscription.save}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                &#8361;{perMonth.toLocaleString()} / {t.subscription.perMonth}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-slate-900">&#8361;{plan.price.toLocaleString()}</p>
              <Button variant="secondary" className="!bg-slate-900 !text-white text-xs hover:!bg-slate-800" onClick={() => setSelected(plan)}>
                {t.subscription.subscribe}
              </Button>
            </div>
          </div>
        );
      })}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6">
            <button
              onClick={() => {
                setSelected(null);
                setConfirmed(false);
                setErrorCode(null);
              }}
              aria-label={t.subscription.cancel}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {confirmed ? (
              <div className="text-center">
                <p className="text-lg font-bold text-brand-600">{t.subscription.subscribed}</p>
                <p className="mt-2 text-sm text-slate-500">{t.subscription.enjoy}</p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900">{t.subscription.confirmTitle}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {gymName} · {selected.months} {selected.months === 1 ? t.subscription.month : t.subscription.months}
                </p>
                <p className="mt-4 text-2xl font-bold text-slate-900">&#8361;{selected.price.toLocaleString()}</p>
                <p className="mt-1 text-xs text-slate-400">{t.subscription.confirmBody}</p>
                {errorCode && (
                  <p className="mt-2 text-xs text-red-500">
                    {errorCode === "ALREADY_SUBSCRIBED" ? t.subscription.alreadySubscribed : t.subscription.failed}
                  </p>
                )}
                <div className="mt-6 flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setSelected(null)}>
                    {t.subscription.cancel}
                  </Button>
                  <Button
                    className="flex-1 !bg-teal-500 hover:!bg-teal-600"
                    onClick={handleConfirm}
                    disabled={submitting}
                  >
                    {t.subscription.confirm}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
