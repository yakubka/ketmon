"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { StarIcon } from "@/components/icons/StarIcon";
import { SportIcon } from "@/components/icons/SportIcons";
import { SearchIcon, SlidersIcon, LocationPinIcon, BoltIcon } from "@/components/icons/UIIcons";
import { FilterSheet } from "@/components/FilterSheet";
import { CyclingGymImage } from "@/components/CyclingGymImage";
import { BookingConfirmModal } from "@/components/BookingConfirmModal";
import { distanceKm } from "@/lib/distance";
import { bandForHour } from "@/lib/time-band";
import { useMessages } from "@/lib/useMessages";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const INCHEON_YEONSU = { lat: 37.4106, lng: 126.6784 };

type NextSlot = {
  id: string;
  startTime: string;
  creditCost: number;
  timeBand: string;
  activityName: string;
};

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
  images: string[];
  sports: string[];
  nextSlot: NextSlot | null;
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
    search: string;
    filters: string;
    apply: string;
    clear: string;
    area: string;
    distance: string;
    any: string;
    quickBook: string;
    nextSlotLabel: string;
    noUpcoming: string;
    matchesInterests: string;
  };
  booking: {
    confirmTitle: string;
    creditCost: string;
    balanceAfter: string;
    cancelWindowNotice: string;
    confirm: string;
    cancel: string;
    booking: string;
    booked: string;
    enjoy: string;
    failed: string;
  };
};

const SPORT_LABELS: Record<string, { en: string; ko: string }> = {
  gym: { en: "Gym", ko: "헬스" },
  yoga: { en: "Yoga", ko: "요가" },
  pilates: { en: "Pilates", ko: "필라테스" },
  boxing: { en: "Boxing", ko: "복싱" },
  swimming: { en: "Swimming", ko: "수영" },
  dance: { en: "Dance", ko: "댄스" },
  crossfit: { en: "CrossFit", ko: "크로스핏" },
  martial_arts: { en: "Martial Arts", ko: "무술" },
  tennis: { en: "Tennis", ko: "테니스" },
};

function formatSport(sport: string, locale: string): string {
  const entry = SPORT_LABELS[sport];
  if (entry) return locale === "ko" ? entry.ko : entry.en;
  return sport.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function recommendScore(gym: GymScored, maxDist: number, favoriteSports: string[]): number {
  const proximity = maxDist > 0 ? Math.max(0, 1 - gym.distance / maxDist) * 30 : 20;
  const rating = (gym.rating / 5) * 25;
  const pop = Math.min(gym.popularity / 100, 1) * 10;
  const variety = Math.min(gym.sports.length / 3, 1) * 5;
  const matchCount = favoriteSports.length > 0 ? gym.sports.filter((s) => favoriteSports.includes(s)).length : 0;
  const favoriteMatch = favoriteSports.length > 0 ? (matchCount / favoriteSports.length) * 30 : 0;
  return proximity + rating + pop + variety + favoriteMatch;
}

function matchesFavorites(gym: GymSummary, favoriteSports: string[]): boolean {
  return favoriteSports.length > 0 && gym.sports.some((s) => favoriteSports.includes(s));
}

export default function HomePage() {
  const [gyms, setGyms] = useState<GymSummary[]>([]);
  const [userPos, setUserPos] = useState(INCHEON_YEONSU);
  const [sportFilter, setSportFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [distanceFilter, setDistanceFilter] = useState("0");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]);
  const [preferredTimeBand, setPreferredTimeBand] = useState<string | null>(null);
  const [quickBook, setQuickBook] = useState<{ gymName: string; slot: NextSlot } | null>(null);
  const t = useMessages<Messages>();

  const locale = typeof window !== "undefined" ? localStorage.getItem("ketmon-locale") || "ko" : "ko";

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, []);

  function loadGyms() {
    fetch("/api/gyms")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGyms(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadGyms();
  }, []);

  function loadUser() {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetch(`/api/user?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then((u) => {
            setUserId(u.id);
            setCreditBalance(u.creditBalance);
            setFavoriteSports(u.favoriteSports ? u.favoriteSports.split(",").filter(Boolean) : []);
            setPreferredTimeBand(u.preferredTimeBand ?? null);
          });
      }
    });
  }

  useEffect(() => {
    loadUser();
  }, []);

  const gymsScored = useMemo(() => {
    const withDist = gyms.map((g) => ({
      ...g,
      distance: distanceKm(userPos.lat, userPos.lng, g.lat, g.lng),
      score: 0,
    }));
    const maxDist = Math.max(...withDist.map((g) => g.distance), 1);
    return withDist
      .map((g) => ({ ...g, score: recommendScore(g, maxDist, favoriteSports) }))
      .sort((a, b) => b.score - a.score);
  }, [gyms, userPos, favoriteSports]);

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

  const distanceOptions = useMemo(() => [
    { value: "0", label: t?.home.any || "Any" },
    { value: "3", label: "3 km" },
    { value: "5", label: "5 km" },
    { value: "10", label: "10 km" },
  ], [t]);

  const filtered = useMemo(() => {
    const dist = Number(distanceFilter);
    const q = search.trim().toLowerCase();
    return gymsScored.filter((g) => {
      if (dist > 0 && g.distance > dist) return false;
      if (sportFilter && !g.sports.includes(sportFilter)) return false;
      if (areaFilter && g.area !== areaFilter) return false;
      if (q && !g.name.toLowerCase().includes(q) && !(g.area ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [gymsScored, sportFilter, areaFilter, distanceFilter, search]);

  const filtersActive = areaFilter !== "" || distanceFilter !== "0";

  function handleQuickBooked() {
    loadGyms();
    loadUser();
  }

  if (!t) return null;

  return (
    <div className="mx-auto max-w-3xl pb-20 lg:max-w-5xl xl:max-w-7xl">
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold text-slate-900">Switch</h1>
        <p className="mt-0.5 text-xs text-slate-500">{t.home.subtitle}</p>
      </div>

      <div className="mt-4 flex gap-2 px-4">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.home.search}
            className="w-full rounded-full bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-shadow focus:bg-white focus:ring-2 focus:ring-teal-200"
          />
        </div>
        <Link
          href="/map"
          className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
        >
          <LocationPinIcon className="h-[18px] w-[18px]" />
        </Link>
        <button
          onClick={() => setFilterOpen((v) => !v)}
          className="relative flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
          aria-label={t.home.filters}
        >
          <SlidersIcon className="h-[18px] w-[18px]" />
          {filtersActive && (
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-teal-500" />
          )}
        </button>
      </div>

      <div className="mt-3 px-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSportFilter("")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              !sportFilter ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.home.allSports}
          </button>
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSportFilter(sportFilter === sport ? "" : sport)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                sportFilter === sport ? "bg-teal-500 text-white shadow-md shadow-teal-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <SportIcon sport={sport} className="h-3.5 w-3.5" active={sportFilter === sport} />
              {formatSport(sport, locale)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <FilterSheet
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          title={t.home.filters}
          areaLabel={t.home.area}
          areaOptions={areaOptions}
          areaValue={areaFilter}
          onAreaChange={setAreaFilter}
          distanceLabel={t.home.distance}
          distanceOptions={distanceOptions}
          distanceValue={distanceFilter}
          onDistanceChange={setDistanceFilter}
          clearLabel={t.home.clear}
          applyLabel={t.home.apply}
          onClear={() => {
            setAreaFilter("");
            setDistanceFilter("0");
          }}
        />
      </div>

      <div className="mt-4 px-4">
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-60 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <SearchIcon className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">{t.home.noClasses}</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((gym) => {
              const nextTime = gym.nextSlot
                ? new Date(gym.nextSlot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : null;
              const fitsSchedule =
                gym.nextSlot && preferredTimeBand
                  ? bandForHour(new Date(gym.nextSlot.startTime).getHours()) === preferredTimeBand
                  : false;
              const matchesInterests = matchesFavorites(gym, favoriteSports);

              return (
                <Link key={gym.id} href={`/gym/${gym.id}`}>
                  <Card className="group flex h-full flex-col overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]">
                    <div className="relative aspect-[4/3]">
                      <CyclingGymImage
                        images={gym.images}
                        fallbackSrc={gym.imageUrl}
                        alt={gym.name}
                        sport={gym.sports[0] ?? "gym"}
                        className="h-full w-full object-cover"
                      />
                      {matchesInterests && (
                        <div className="absolute left-1.5 top-1.5 rounded-full bg-teal-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">
                          {t.home.matchesInterests}
                        </div>
                      )}
                      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        <StarIcon className="h-2.5 w-2.5 text-amber-400" />
                        {gym.rating.toFixed(1)}
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        <LocationPinIcon className="h-2.5 w-2.5" />
                        {gym.distance.toFixed(1)} km
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-2.5">
                      <p className="truncate text-xs font-semibold text-slate-900">{gym.name}</p>
                      {gym.area && <p className="mt-0.5 truncate text-[10px] text-slate-500">{gym.area}</p>}
                      <div className="mt-1.5 flex flex-wrap gap-0.5">
                        {gym.sports.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-0.5 rounded-full bg-teal-50 px-1.5 py-0.5 text-[9px] font-medium text-teal-700"
                          >
                            <SportIcon sport={s} className="h-2 w-2" />
                            {formatSport(s, locale)}
                          </span>
                        ))}
                        {gym.sports.length > 2 && (
                          <span className="rounded-full bg-slate-50 px-1.5 py-0.5 text-[9px] text-slate-400">
                            +{gym.sports.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto pt-2">
                        {gym.nextSlot ? (
                          <div className="flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2">
                            <span className="truncate text-[10px] text-slate-400">
                              {t.home.nextSlotLabel} <span className="font-semibold text-slate-600">{nextTime}</span>
                              {fitsSchedule && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-teal-500 align-middle" />}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQuickBook({ gymName: gym.name, slot: gym.nextSlot! });
                              }}
                              className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-teal-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm shadow-teal-200 transition-colors hover:bg-teal-600"
                            >
                              <BoltIcon className="h-2.5 w-2.5" />
                              {t.home.quickBook}
                            </button>
                          </div>
                        ) : (
                          <p className="border-t border-slate-100 pt-2 text-[10px] text-slate-300">{t.home.noUpcoming}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {quickBook && userId && (
        <BookingConfirmModal
          classSlot={{
            id: quickBook.slot.id,
            creditCost: quickBook.slot.creditCost,
            startTime: quickBook.slot.startTime,
            activityName: `${quickBook.slot.activityName} · ${quickBook.gymName}`,
          }}
          userId={userId}
          creditBalance={creditBalance}
          onClose={() => setQuickBook(null)}
          onBooked={handleQuickBooked}
        />
      )}
    </div>
  );
}
