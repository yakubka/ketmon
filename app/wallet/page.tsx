"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useMessages } from "@/lib/useMessages";

type Transaction = {
  id: string;
  amount: number;
  type: "PURCHASE" | "SPEND" | "REFUND";
  createdAt: string;
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
  };
};

const PACKS = [10, 30, 50];

export default function WalletPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
            return fetch(`/api/wallet/transactions?userId=${u.id}`);
          })
          .then((r) => r.json())
          .then((txns) => {
            setTransactions(txns);
            setLoading(false);
          });
      }
    });
  }, []);

  async function handleTopUp(amount: number) {
    if (!userId) return;
    setTopUpLoading(amount);
    const res = await fetch("/api/wallet/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount }),
    });
    const data = await res.json();
    setBalance(data.creditBalance);

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

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-lg font-bold text-slate-900">{t.wallet.title}</h1>

      <Card className="mt-4 p-6 text-center">
        <p className="text-sm text-slate-500">{t.wallet.balance}</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{balance}</p>
        <p className="text-xs text-slate-400">{t.wallet.credits}</p>
      </Card>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-500">{t.wallet.buyCredits}</h2>
        <div className="mt-3 flex gap-3">
          {PACKS.map((amount) => (
            <Button
              key={amount}
              variant="secondary"
              className="flex-1"
              onClick={() => handleTopUp(amount)}
              disabled={topUpLoading === amount}
            >
              {topUpLoading === amount ? "..." : `${amount} cr`}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-slate-500">{t.wallet.history}</h2>
        {transactions.length === 0 && (
          <p className="mt-2 text-sm text-slate-400">{t.wallet.noTransactions}</p>
        )}
        <div className="mt-3 space-y-1">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-slate-700">
                  {TYPE_LABELS[txn.type] ?? txn.type}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  {new Date(txn.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <span
                className={`font-semibold ${txn.amount > 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {txn.amount > 0 ? "+" : "−"}
                {Math.abs(txn.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
