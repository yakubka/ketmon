"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useMessages } from "@/lib/useMessages";
import GlyphPortal from "@/components/ui/glyph-portal";

type Messages = {
  welcome: { headline: string; subline: string; continueWithGoogle: string };
};

export default function WelcomePage() {
  const messages = useMessages<Messages>();

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

  if (!messages) return null;

  return (
    <div style={{ width: "100%", height: "100svh", overflowY: "auto" }}>
      <GlyphPortal
        word="SWITCH"
        fontWeight={900}
        scrollLength={2.4}
        interactive
        enterLabel="Get started"
        style={{
          "--gp-paper": "#ffffff",
          "--gp-ink": "#0f172a",
          "--gp-field": "#0d9488",
          "--gp-foreground": "#ffffff",
        }}
        front={
          <>
            <div style={{
              position: "absolute",
              inset: "clamp(24px,4.5vw,48px) clamp(24px,5vw,64px) auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.04em", color: "#0f172a" }}>
                Switch
              </span>
              <LanguageToggle />
            </div>

            <p style={{
              position: "absolute",
              inset: "auto 24px calc(100% - var(--gp-word-top,35%) + 28px)",
              margin: 0,
              textAlign: "center",
              fontSize: 13,
              fontWeight: 400,
              lineHeight: 1.5,
              color: "#64748b",
            }}>
              {messages.welcome.subline}
            </p>

            <p style={{
              position: "absolute",
              inset: "calc(var(--gp-word-bottom,50%) + 28px) 24px auto",
              margin: 0,
              textAlign: "center",
              fontSize: 15,
              fontWeight: 400,
              lineHeight: 1.5,
              color: "#475569",
            }}>
              {messages.welcome.headline}
            </p>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, textAlign: "center" }}>
          <h2 style={{
            margin: 0,
            color: "inherit",
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}>
            {messages.welcome.headline}
          </h2>

          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, opacity: 0.85, maxWidth: "36ch" }}>
            {messages.welcome.subline}
          </p>

          <button
            onClick={handleLogin}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              minHeight: 52,
              padding: "0 32px",
              background: "#ffffff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 12,
              color: "#0d9488",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {messages.welcome.continueWithGoogle}
          </button>
        </div>
      </GlyphPortal>
    </div>
  );
}
