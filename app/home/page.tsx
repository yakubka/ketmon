"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { StarIcon } from "@/components/icons/StarIcon";
import { distanceKm } from "@/lib/distance";
import { useMessages } from "@/lib/useMessages";
import { WheelPicker } from "@/components/WheelPicker";
import Link from "next/link";

const INCHEON_YEONSU = { lat: 37.4106, lng: 126.6784 };

type GymSummary = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  popularity: number;
  tier: string;
  area: string | null;
  imageUrl: string | null;
  sports: string[];
};

type GymScored = GymSummary & { distance: number; score: number };

type Messages = {
  home: {
    title: string;
    subtitle: string;
    toggleMap: string;
    allSports: string;
    allAreas: string;
    noClasses: string;
    nearby: string;
    popular: string;
    recommended: string;
  };
};

const SPORT_LABELS: Record<string, { en: string; ko: string; icon: string }> = {
  gym: { en: "Gym", ko: "헬스", icon: "M3 6h18M3 18h18M6 6v12M18 6v12" },
  yoga: { en: "Yoga", ko: "요가", icon: "M12 2a10 10 0 100 20 10 10 0 000-20z" },
  pilates: { en: "Pilates", ko: "필라테스", icon: "M12 2v20M2 12h20" },
  boxing: { en: "Boxing", ko: "복싱", icon: "M12 2L2 7l10 5 10-5-10-5z" },
  swimming: { en: "Swimming", ko: "수영", icon: "M2 18c1.5-1.5 3-2 5-2s3.5.5 5 2c1.5-1.5 3-2 5-2" },
  dance: { en: "Dance", ko: "댄스", icon: "M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10" },
  crossfit: { en: "CrossFit", ko: "크로스핏", icon: "M12 2L2 12l10 10 10-10L12 2z" },
  martial_arts: { en: "Martial Arts", ko: "무술", icon: "M14.5 2l5 5-7 7-5-5 7-7z" },
  tennis: { en: "Tennis", ko: "테니스", icon: "M12 2a10 10 0 100 20 10 10 0 000-20z" },
};

function formatSport(sport: string, locale: string): string {
  const entry = SPORT_LABELS[sport];
  if (entry) return locale === "ko" ? entry.ko : entry.en;
  return sport.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const DISTANCE_OPTIONS = [
  { value: "0", label: "All" },
  { value: "3", label: "3 km" },
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
];

function recommendScore(gym: GymScored, maxDist: number): number {
  const proximity = maxDist > 0 ? Math.max(0, 1 - gym.distance / maxDist) * 35 : 20;
  const rating = (gym.rating / 5) * 35;
  const pop = Math.min(gym.popularity / 100, 1) * 20;
  const variety = Math.min(gym.sports.length / 3, 1) * 10;
  return proximity + rating + pop + variety;
}

export default function HomePage() {
  const [gyms, setGyms] = useState<GymSummary[]>([]);
  const [userPos, setUserPos] = useState(INCHEON_YEONSU);
  const [sportFilter, setSportFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [distanceFilter, setDistanceFilter] = useState("0");
  const [loading, setLoading] = useState(true);
  const t = useMessages<Messages>();

  const locale = typeof window !== "undefined" ? localStorage.getItem("ketmon-locale") || "ko" : "ko";

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, []);

  useEffect(() => {
    fetch("/api/gyms")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGyms(data);
        setLoading(false);
      });
  }, []);

  const gymsScored = useMemo(() => {
    const withDist = gyms.map((g) => ({
      ...g,
      distance: distanceKm(userPos.lat, userPos.lng, g.lat, g.lng),
      score: 0,
    }));
    const maxDist = Math.max(...withDist.map((g) => g.distance), 1);
    return withDist
      .map((g) => ({ ...g, score: recommendScore(g, maxDist) }))
      .sort((a, b) => b.score - a.score);
  }, [gyms, userPos]);

  const sports = useMemo(() => {
    const set = new Set<string>();
    for (const g of gyms) for (const s of g.sports) set.add(s);
    return Array.from(set).sort();
  }, [gyms]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    for (const g of gyms) if (g.area) set.add(g.area);
    return Array.from(set).sort();
  }, [gyms]);

  const areaOptions = useMemo(() => [
    { value: "", label: t?.home.allAreas || "All areas" },
    ...areas.map((a) => ({ value: a, label: a })),
  ], [areas, t]);

  const filtered = useMemo(() => {
    const dist = Number(distanceFilter);
    return gymsScored.filter((g) => {
      if (dist > 0 && g.distance > dist) return false;
      if (sportFilter && !g.sports.includes(sportFilter)) return false;
      if (areaFilter && g.area !== areaFilter) return false;
      return true;
    });
  }, [gymsScored, sportFilter, areaFilter, distanceFilter]);

  if (!t) return null;

  return (
    <div className="mx-auto max-w-3xl pb-20">
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Switch</h1>
            <p className="mt-0.5 text-xs text-slate-500">{t.home.subtitle}</p>
          </div>
          <Link
            href="/map"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="mt-5 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setSportFilter("")}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              !sportFilter ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.home.allSports}
          </button>
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSportFilter(sportFilter === sport ? "" : sport)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                sportFilter === sport ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {formatSport(sport, locale)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-2 px-4">
        <WheelPicker
          options={areaOptions}
          value={areaFilter}
          onChange={setAreaFilter}
          label={t.home.allAreas}
        />
        <WheelPicker
          options={DISTANCE_OPTIONS}
          value={distanceFilter}
          onChange={setDistanceFilter}
          label="Distance"
        />
      </div>

      <div className="mt-5 px-4">
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="mt-3 text-sm text-slate-400">{t.home.noClasses}</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((gym) => (
              <Link key={gym.id} href={`/gym/${gym.id}`}>
                <Card className="group h-full overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]">
                  <div className="relative aspect-[4/3]">
                    {gym.imageUrl ? (
                      <img
                        src={gym.imageUrl}
                        alt={gym.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5">
                          <path d="M3 6h18M3 18h18M6 6v12M18 6v12" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      <StarIcon className="h-2.5 w-2.5 text-amber-400" />
                      {gym.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-semibold text-slate-900">{gym.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      {gym.area && `${gym.area} · `}{gym.distance.toFixed(1)} km
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-0.5">
                      {gym.sports.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[9px] font-medium text-teal-700"
                        >
                          {formatSport(s, locale)}
                        </span>
                      ))}
                      {gym.sports.length > 2 && (
                        <span className="rounded-full bg-slate-50 px-1.5 py-0.5 text-[9px] text-slate-400">
                          +{gym.sports.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
