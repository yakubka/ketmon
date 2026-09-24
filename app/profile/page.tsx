"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  creditBalance: number;
  locale: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetch(`/api/user?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then((u) => {
            setUser(u);
            setLoading(false);
          });
      }
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-lg font-bold text-slate-900">Profile</h1>

      <Card className="mt-4 p-5">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-400">Name</p>
            <p className="text-sm font-medium text-slate-900">
              {user.name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="text-sm text-slate-700">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Role</p>
            <p className="text-sm text-slate-700">{user.role}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Balance</p>
            <p className="text-sm font-semibold text-brand-600">
              {user.creditBalance} credits
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-4 flex items-center justify-between p-5">
        <div>
          <p className="text-xs text-slate-400">Language</p>
          <p className="text-sm text-slate-700">
            {user.locale === "ko" ? "한국어" : "English"}
          </p>
        </div>
        <LanguageToggle />
      </Card>

      <div className="mt-6">
        <Button variant="ghost" onClick={handleLogout} className="w-full text-red-500">
          Log out
        </Button>
      </div>
    </div>
  );
}
