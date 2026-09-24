"use client";

import { useState, useEffect } from "react";

const LOCALES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "EN" },
] as const;

type Locale = (typeof LOCALES)[number]["code"];

export function LanguageToggle() {
  const [locale, setLocale] = useState<Locale>("ko");

  useEffect(() => {
    const stored = localStorage.getItem("ketmon-locale") as Locale | null;
    if (stored) setLocale(stored);
  }, []);

  function toggle() {
    const next = locale === "ko" ? "en" : "ko";
    setLocale(next);
    localStorage.setItem("ketmon-locale", next);
    window.location.reload();
  }

  return (
    <button
      onClick={toggle}
      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
    >
      {locale === "ko" ? "EN" : "한국어"}
    </button>
  );
}
