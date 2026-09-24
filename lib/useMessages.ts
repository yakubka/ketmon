"use client";

import { useEffect, useState } from "react";

export function useMessages<T = Record<string, unknown>>(): T | null {
  const [messages, setMessages] = useState<T | null>(null);

  useEffect(() => {
    const locale = localStorage.getItem("ketmon-locale") ?? "ko";
    import(`@/messages/${locale}.json`).then((m) => setMessages(m.default as T));
  }, []);

  return messages;
}

export function useLocale(): string {
  const [locale, setLocale] = useState("ko");

  useEffect(() => {
    setLocale(localStorage.getItem("ketmon-locale") ?? "ko");
  }, []);

  return locale;
}
