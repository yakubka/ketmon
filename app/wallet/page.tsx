"use client";

import { useEffect, useState } from "react";
import { Label, Pie, PieChart } from "recharts";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { createClient } from "@/lib/supabase/client";
import { useMessages } from "@/lib/useMessages";

type Transaction = {
  id: string;
  amount: number;
  type: "PURCHASE" | "SPEND" | "REFUND";
  createdAt: string;
};

type SpendItem = {
  sport: string;
  credits: number;
};

type Messages = {
  wallet: {
    title: string;
    balance: string;
    credits: string;
    buyCredits: string;
    history: string;
    noTransactions: string;
    topUp: string;
    bookingTxn: string;
    refund: string;
    subscription: string;
    activePlan: string;
    expiresOn: string;
    noPlan: string;
    spending: string;
    totalSpent: string;
    noSpending: string;
  };
};

const PLANS = [
  { credits: 20, price: 29900, label: "Starter", days: 30, gradient: "from-emerald-400 via-teal-500 to-teal-600" },
  { credits: 40, price: 49900, label: "Standard", days: 30, popular: true, gradient: "from-fuchsia-500 via-purple-500 to-indigo-600" },
  { credits: 80, price: 79900, label: "Premium", days: 30, gradient: "from-amber-400 via-orange-500 to-rose-500" },
];

const SPORT_COLORS = [
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
];

export default function WalletPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [planName, setPlanName] = useState<string | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spending, setSpending] = useState<SpendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState<number | null>(null);
  const t = useMessages<Messages>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetch(`/api/user?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then((u) => {
            setUserId(u.id);
            setBalance(u.creditBalance);
            setPlanName(u.planName ?? null);
            setPlanExpiresAt(u.planExpiresAt ?? null);
            return Promise.all([
              fetch(`/api/wallet/transactions?userId=${u.id}`).then((r) => r.json()),
              fetch(`/api/wallet/stats?userId=${u.id}`).then((r) => r.json()),
            ]);
          })
          .then(([txns, stats]) => {
            setTransactions(txns);
            if (stats.spending) setSpending(stats.spending);
            setLoading(false);
          });
      }
    });
  }, []);

  async function handleTopUp(credits: number) {
    if (!userId) return;
    setTopUpLoading(credits);
    const res = await fetch("/api/wallet/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount: credits }),
    });
    const data = await res.json();
    setBalance(data.creditBalance);
    if (data.planName) setPlanName(data.planName);
    if (data.planExpiresAt) setPlanExpiresAt(data.planExpiresAt);

    const txns = await fetch(`/api/wallet/transactions?userId=${userId}`).then((r) => r.json());
    setTransactions(txns);
    setTopUpLoading(null);
  }

  if (loading || !t) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  const TYPE_LABELS: Record<string, string> = {
    PURCHASE: t.wallet.topUp,
    SPEND: t.wallet.bookingTxn,
    REFUND: t.wallet.refund,
  };

  const TYPE_ICONS: Record<string, string> = {
    PURCHASE: "+",
    SPEND: "-",
    REFUND: "+",
  };

  const totalSpent = spending.reduce((sum, s) => sum + s.credits, 0);

  const chartData = spending.map((s, i) => ({
    sport: s.sport,
    credits: s.credits,
    fill: SPORT_COLORS[i % SPORT_COLORS.length],
  }));

  const chartConfig: ChartConfig = {
    credits: { label: t.wallet.credits },
    ...Object.fromEntries(
      spending.map((s, i) => [
        s.sport,
        { label: s.sport, color: SPORT_COLORS[i % SPORT_COLORS.length] },
      ]),
    ),
  };

  const isExpired = planExpiresAt ? new Date(planExpiresAt) < new Date() : false;
  const daysLeft = planExpiresAt
    ? Math.max(0, Math.ceil((new Date(planExpiresAt).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-24">
      <h1 className="text-lg font-bold text-slate-900">{t.wallet.title}</h1>

      <Card className="mt-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{t.wallet.balance}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{balance}</p>
            <p className="text-xs text-slate-400">{t.wallet.credits}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
            <svg className="h-7 w-7 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${planName ? (isExpired ? "bg-red-50" : "bg-teal-50") : "bg-slate-50"}`}>
              <svg className={`h-5 w-5 ${planName ? (isExpired ? "text-red-500" : "text-teal-500") : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {planName ? `${planName} ${t.wallet.activePlan}` : t.wallet.noPlan}
              </p>
              {planExpiresAt && !isExpired && (
                <p className="text-xs text-slate-500">
                  {t.wallet.expiresOn}{" "}
                  {new Date(planExpiresAt).toLocaleDateString([], {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
              {planExpiresAt && isExpired && (
                <p className="text-xs text-red-500">Expired</p>
              )}
            </div>
          </div>
          {planName && !isExpired && (
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-600">
              {daysLeft}d
            </span>
          )}
        </div>
      </Card>

      {spending.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-slate-500">{t.wallet.spending}</h2>
          <Card className="mt-3 p-4">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-48">
              <PieChart margin={{ top: -10 }}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="credits"
                  nameKey="sport"
                  innerRadius={55}
                  strokeWidth={40}
                  startAngle={90}
                  endAngle={-270}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 10}
                              className="fill-slate-400 text-xs"
                            >
                              {t.wallet.totalSpent}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 14}
                              className="fill-slate-900 text-lg font-semibold"
                            >
                              {totalSpent}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 flex flex-col gap-2.5">
              {spending.map((item, i) => {
                const pct = totalSpent > 0 ? Math.round((item.credits / totalSpent) * 100) : 0;
                return (
                  <div key={item.sport} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-1 rounded-full"
                        style={{ backgroundColor: SPORT_COLORS[i % SPORT_COLORS.length] }}
                      />
                      <span className="text-sm text-slate-600">{item.sport}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{item.credits}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-500">{t.wallet.buyCredits}</h2>
        <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-0.5 pb-2" style={{ scrollbarWidth: "none" }}>
          {PLANS.map((plan) => {
            const visits = Math.round(plan.credits / 4);
            return (
              <div
                key={plan.credits}
                className={`relative min-w-[220px] flex-shrink-0 snap-center overflow-hidden rounded-3xl shadow-lg transition-transform active:scale-[0.97] ${plan.popular ? "ring-2 ring-offset-2 ring-fuchsia-400" : ""}`}
              >
                {plan.popular && (
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-600 shadow-sm backdrop-blur-sm">
                    POPULAR
                  </span>
                )}
                <div className={`relative overflow-hidden bg-gradient-to-br ${plan.gradient} px-4 pb-4 pt-5`}>
                  <div className="pointer-events-none absolute -right-4 -top-6 h-24 w-24 rounded-full bg-white/10" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{plan.label}</p>
                  <p className="mt-1 text-5xl font-black leading-none text-white drop-shadow-sm">{plan.credits}</p>
                  <p className="mt-1 text-xs text-white/80">{t.wallet.credits} · {plan.days}d</p>
                </div>
                <div className="bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">&#8361;{plan.price.toLocaleString()}</p>
                  <p className="mt-0.5 text-xs text-slate-400">~{visits} visits</p>
                  <Button
                    variant="primary"
                    className="mt-3 w-full !bg-slate-900 text-xs hover:!bg-slate-800"
                    onClick={() => handleTopUp(plan.credits)}
                    disabled={topUpLoading === plan.credits}
                  >
                    {topUpLoading === plan.credits ? "..." : t.wallet.topUp}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-slate-500">{t.wallet.history}</h2>
        {transactions.length === 0 && (
          <p className="mt-3 text-center text-sm text-slate-400">{t.wallet.noTransactions}</p>
        )}
        <div className="mt-3 space-y-1">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${txn.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                  {TYPE_ICONS[txn.type]}
                </div>
                <div>
                  <span className="font-medium text-slate-700">
                    {TYPE_LABELS[txn.type] ?? txn.type}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {new Date(txn.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <span
                className={`font-semibold ${txn.amount > 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {txn.amount > 0 ? "+" : ""}
                {txn.amount}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
