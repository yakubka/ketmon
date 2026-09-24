"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { SportIcon } from "@/components/icons/SportIcons";
import { SunriseIcon, SunIcon, SunsetIcon, MoonIcon } from "@/components/icons/UIIcons";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMessages } from "@/lib/useMessages";
import type { TimeBand } from "@/lib/time-band";

type Messages = {
  onboarding: {
    nameStep: { title: string; subtitle: string; placeholder: string; next: string };
    sportsStep: { title: string; subtitle: string; next: string; skip: string };
    timeStep: {
      title: string;
      subtitle: string;
      morning: string;
      morningRange: string;
      midday: string;
      middayRange: string;
      evening: string;
      eveningRange: string;
      night: string;
      nightRange: string;
      next: string;
    };
    planStep: { title: string; subtitle: string; start: string; credits: string; perCredit: string; popular: string };
  };
};

const SPORTS = ["gym", "tennis", "swimming", "yoga", "boxing", "pilates", "crossfit", "dance"];

const TIME_OPTIONS: { band: TimeBand; icon: (p: { className?: string }) => JSX.Element }[] = [
  { band: "morning", icon: SunriseIcon },
  { band: "midday", icon: SunIcon },
  { band: "evening", icon: SunsetIcon },
  { band: "night", icon: MoonIcon },
];

const PLANS = [
  { credits: 20, price: 29900, label: "Starter", perCredit: 1495 },
  { credits: 40, price: 49900, label: "Standard", perCredit: 1248, popular: true },
  { credits: 80, price: 79900, label: "Premium", perCredit: 999 },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [timeBand, setTimeBand] = useState<TimeBand | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const t = useMessages<Messages>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetch(`/api/user?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then((u) => {
            setUserId(u.id);
            if (u.name) setName(u.name);
          });
      }
    });
  }, []);

  async function saveName() {
    if (!userId || !name.trim()) return;
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name: name.trim() }),
    });
    setStep(1);
  }

  function toggleSport(id: string) {
    setSelectedSports((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function saveProfileAndAdvance() {
    if (userId) {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          favoriteSports: selectedSports,
          preferredTimeBand: timeBand,
        }),
      });
    }
    setStep(3);
  }

  async function handlePlan(credits: number) {
    if (!userId) return;
    await fetch("/api/wallet/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount: credits }),
    });
    router.push("/home");
  }

  if (!t) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-10 rounded-full transition-colors ${
                i <= step ? "bg-teal-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">{t.onboarding.nameStep.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{t.onboarding.nameStep.subtitle}</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.onboarding.nameStep.placeholder}
              className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg font-medium text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && name.trim() && saveName()}
            />
            <Button
              variant="primary"
              className="mt-6 w-full"
              onClick={saveName}
              disabled={!name.trim()}
            >
              {t.onboarding.nameStep.next}
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">{t.onboarding.sportsStep.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{t.onboarding.sportsStep.subtitle}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {SPORTS.map((sport) => {
                const selected = selectedSports.includes(sport);
                return (
                  <button
                    key={sport}
                    onClick={() => toggleSport(sport)}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium capitalize transition-colors ${
                      selected
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <SportIcon sport={sport} className="h-5 w-5 flex-shrink-0" />
                    {sport.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl py-3 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                {t.onboarding.sportsStep.skip}
              </button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                {t.onboarding.sportsStep.next}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">{t.onboarding.timeStep.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{t.onboarding.timeStep.subtitle}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {TIME_OPTIONS.map(({ band, icon: Icon }) => {
                const selected = timeBand === band;
                return (
                  <button
                    key={band}
                    onClick={() => setTimeBand(band)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 transition-colors ${
                      selected
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-semibold">{t.onboarding.timeStep[band]}</span>
                    <span className="text-[11px] text-slate-400">{t.onboarding.timeStep[`${band}Range` as "morningRange"]}</span>
                  </button>
                );
              })}
            </div>
            <Button
              variant="primary"
              className="mt-6 w-full"
              onClick={saveProfileAndAdvance}
              disabled={!timeBand}
            >
              {t.onboarding.timeStep.next}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">{t.onboarding.planStep.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{t.onboarding.planStep.subtitle}</p>
            <div className="mt-6 space-y-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.credits}
                  onClick={() => handlePlan(plan.credits)}
                  className={`relative w-full rounded-xl border-2 p-4 text-left transition-colors ${
                    plan.popular
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {t.onboarding.planStep.popular}
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{plan.label}</p>
                      <p className="text-xs text-slate-500">
                        {plan.credits} {t.onboarding.planStep.credits}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900">
                        &#8361;{plan.price.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        ~&#8361;{plan.perCredit.toLocaleString()} / {t.onboarding.planStep.perCredit}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => router.push("/home")}
              className="mt-4 text-sm text-slate-400 hover:text-slate-600"
            >
              {t.onboarding.sportsStep.skip}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
