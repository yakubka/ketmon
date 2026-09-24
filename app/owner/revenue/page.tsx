"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { creditsToWonDisplay } from "@/lib/pricing";
import { useMessages } from "@/lib/useMessages";

type Commission = {
  id: string;
  amount: number;
  createdAt: string;
};

type RevenueData = {
  payoutsTotal: number;
  noShowCompensation: number;
  commissionsTotal: number;
  commissions: Commission[];
};

type Messages = {
  owner: {
    revenueTitle: string;
    payoutsReceived: string;
    noShowCompensation: string;
    noShowMessage: string;
    conversionCommissions: string;
  };
  wallet: {
    credits: string;
  };
};

export default function OwnerRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useMessages<Messages>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: authData }) => {
      if (authData.user?.email) {
        fetch(`/api/user?email=${encodeURIComponent(authData.user.email)}`)
          .then((r) => r.json())
          .then((u) => fetch(`/api/owner/revenue?ownerId=${u.id}`))
          .then((r) => r.json())
          .then((rev) => {
            setData(rev);
            setLoading(false);
          });
      }
    });
  }, []);

  if (loading || !data || !t) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="h-60 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-lg font-bold text-slate-900">{t.owner.revenueTitle}</h1>

      <div className="mt-6 space-y-4">
        <Card className="p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t.owner.payoutsReceived}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data.payoutsTotal.toFixed(1)}
          </p>
          <p className="text-xs text-slate-400">
            {t.wallet.credits} (~&#8361;{creditsToWonDisplay(Math.round(data.payoutsTotal)).toLocaleString()})
          </p>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/50 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            {t.owner.noShowCompensation}
          </p>
          <p className="mt-1 text-sm text-emerald-700">
            {t.owner.noShowMessage}
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {data.noShowCompensation.toFixed(1)}
          </p>
          <p className="text-xs text-emerald-500">{t.wallet.credits}</p>
        </Card>

        <Card className="border-brand/20 bg-brand-50/50 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {t.owner.conversionCommissions}
          </p>
          <p className="mt-2 text-3xl font-bold text-brand-700">
            &#8361;{data.commissionsTotal.toLocaleString()}
          </p>

          {data.commissions.length > 0 && (
            <div className="mt-4 space-y-1 text-left">
              {data.commissions.map((c) => (
                <div key={c.id} className="flex justify-between text-xs">
                  <span className="text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-medium text-brand-700">
                    +&#8361;{c.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
