"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useState, useEffect } from "react";

type Messages = {
  welcome: { headline: string; subline: string; continueWithGoogle: string };
};

export default function WelcomePage() {
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const locale = localStorage.getItem("ketmon-locale") ?? "ko";
    import(`@/messages/${locale}.json`).then((m) => setMessages(m.default));
  }, []);

  async function handleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (!messages) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
          {messages.welcome.headline}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          {messages.welcome.subline}
        </p>

        <div className="mt-10">
          <Button onClick={handleLogin} className="w-full">
            {messages.welcome.continueWithGoogle}
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Ketmon — 무약정 운동
        </p>
      </div>
    </div>
  );
}
