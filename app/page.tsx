"use client";

import { createClient } from "@/lib/supabase/client";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useMessages } from "@/lib/useMessages";
import Link from "next/link";

type Messages = {
  welcome: { headline: string; subline: string; continueWithGoogle: string };
  landing: {
    hero: { title: string; subtitle: string; cta: string; login: string };
    features: {
      variety: { title: string; desc: string };
      credits: { title: string; desc: string };
      convenience: { title: string; desc: string };
    };
    sports: { title: string; subtitle: string };
    howItWorks: {
      title: string;
      step1: { title: string; desc: string };
      step2: { title: string; desc: string };
      step3: { title: string; desc: string };
    };
    plans: {
      title: string;
      starter: string;
      standard: string;
      premium: string;
      popular: string;
      perCredit: string;
      getStarted: string;
      credits: string;
    };
    cities: { title: string };
    footer: { privacy: string; terms: string; contact: string; copyright: string };
  };
};

const SPORTS = [
  { icon: "\u{1F3CB}", ko: "트레이닝", en: "Gym" },
  { icon: "\u{1F3BE}", ko: "테니스", en: "Tennis" },
  { icon: "\u{1F3CA}", ko: "수영", en: "Swimming" },
  { icon: "\u{1F9D8}", ko: "요가", en: "Yoga" },
  { icon: "\u{1F94A}", ko: "박싱", en: "Boxing" },
  { icon: "\u{1F938}", ko: "필라테스", en: "Pilates" },
  { icon: "\u{1F3C3}", ko: "크로스핏", en: "CrossFit" },
  { icon: "\u{1F483}", ko: "댄스", en: "Dance" },
];

const CITIES_KO = [
  "서울", "인천", "부산", "대구", "대전",
  "광주", "울산", "수원", "성남", "고양",
  "용인", "창원", "제주",
];

const CITIES_EN = [
  "Seoul", "Incheon", "Busan", "Daegu", "Daejeon",
  "Gwangju", "Ulsan", "Suwon", "Seongnam", "Goyang",
  "Yongin", "Changwon", "Jeju",
];

const PLANS = [
  { credits: 20, price: 29900, key: "starter", perCredit: 1495 },
  { credits: 40, price: 49900, key: "standard", perCredit: 1248, popular: true },
  { credits: 80, price: 79900, key: "premium", perCredit: 999 },
];

export default function LandingPage() {
  const t = useMessages<Messages>();
  const locale = typeof window !== "undefined" ? localStorage.getItem("ketmon-locale") || "ko" : "ko";

  async function handleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "https://www.googleapis.com/auth/calendar.events",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  }

  if (!t) return null;

  const cities = locale === "ko" ? CITIES_KO : CITIES_EN;

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Switch" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold tracking-tight text-slate-900">Switch</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={handleLogin}
              className="rounded-full bg-teal-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-600"
            >
              {t.landing.hero.login}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-400 to-emerald-400 py-16 sm:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-white/10" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl">
                {t.landing.hero.title}
              </h1>
              <p className="mt-4 max-w-md text-base text-white/80">
                {t.landing.hero.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 sm:justify-start">
                <button
                  onClick={handleLogin}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-teal-600 shadow-lg transition-transform hover:scale-105"
                >
                  {t.landing.hero.cta}
                </button>
              </div>
            </div>
            <div className="mt-10 flex-shrink-0 sm:mt-0">
              <div className="relative mx-auto h-[340px] w-[170px] overflow-hidden rounded-[28px] border-4 border-white/30 bg-slate-900 shadow-2xl">
                <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                  <img src="/logo.svg" alt="" className="mb-3 h-12 w-12 rounded-xl" />
                  <p className="text-lg font-bold text-white">Switch</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {t.welcome.subline}
                  </p>
                  <div className="mt-4 w-full space-y-2">
                    <div className="h-16 rounded-lg bg-teal-500/20" />
                    <div className="h-12 rounded-lg bg-teal-500/10" />
                    <div className="h-12 rounded-lg bg-teal-500/10" />
                  </div>
                  <div className="mt-auto flex w-full justify-around border-t border-slate-700 pt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 w-4 rounded-full bg-slate-700" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-6 sm:grid-cols-3">
            {(["variety", "credits", "convenience"] as const).map((key) => (
              <div key={key} className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round">
                    {key === "variety" && <><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></>}
                    {key === "credits" && <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>}
                    {key === "convenience" && <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>}
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{t.landing.features[key].title}</h3>
                <p className="mt-2 text-sm text-slate-500">{t.landing.features[key].desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">{t.landing.sports.title}</h2>
          <p className="mt-2 text-center text-sm text-slate-500">{t.landing.sports.subtitle}</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SPORTS.map((sport) => (
              <div
                key={sport.en}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="text-2xl">{sport.icon}</span>
                <span className="text-sm font-medium text-slate-700">
                  {locale === "ko" ? sport.ko : sport.en}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">{t.landing.howItWorks.title}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {(["step1", "step2", "step3"] as const).map((key, i) => (
              <div key={key} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-xl font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{t.landing.howItWorks[key].title}</h3>
                <p className="mt-2 text-sm text-slate-500">{t.landing.howItWorks[key].desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">{t.landing.plans.title}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-2xl bg-white p-6 shadow-sm ${plan.popular ? "ring-2 ring-teal-500 shadow-lg" : ""}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-white">
                    {t.landing.plans.popular}
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">
                  {t.landing.plans[plan.key as keyof typeof t.landing.plans]}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {plan.credits} {t.landing.plans.credits}
                </p>
                <p className="mt-4 text-2xl font-bold text-slate-900">
                  &#8361;{plan.price.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">
                  ~&#8361;{plan.perCredit.toLocaleString()} / {t.landing.plans.perCredit}
                </p>
                <button
                  onClick={handleLogin}
                  className={`mt-6 w-full rounded-full py-2.5 text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-teal-500 text-white hover:bg-teal-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t.landing.plans.getStarted}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">{t.landing.cities.title}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {cities.map((city) => (
              <span
                key={city}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition-colors hover:border-teal-300 hover:text-teal-600"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Switch" className="h-6 w-6 rounded-md" />
              <span className="text-sm font-bold text-slate-900">Switch</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="/privacy" className="hover:text-teal-600">{t.landing.footer.privacy}</Link>
              <Link href="/terms" className="hover:text-teal-600">{t.landing.footer.terms}</Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">{t.landing.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
