"use client";

import { useState, useEffect, useMemo } from "react";
import { GymCard } from "@/components/GymCard";
import { Button } from "@/components/ui/Button";
import { distanceKm } from "@/lib/distance";
import { useMessages } from "@/lib/useMessages";
import Link from "next/link";

const GANGNAM = { lat: 37.4979, lng: 127.0276 };

type Slot = {
  id: string;
  startTime: string;
  timeBand: "OFF_PEAK" | "STANDARD" | "PEAK";
  creditCost: number;
  capacity: number;
  booked: number;
};

type Activity = {
  id: string;
  name: string;
  sport: string;
  slots: Slot[];
};

type Gym = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  popularity: number;
  tier: string;
  area: string | null;
  imageUrl: string | null;
  activities: Activity[];
};

type FlatItem = {
  gym: Gym;
  activity: Activity;
  slot: Slot;
  distance: number;
};

type Messages = {
  home: {
    title: string;
    subtitle: string;
    toggleMap: string;
    allSports: string;
    allTimes: string;
    allAreas: string;
    noClasses: string;
  };
  timeBand: Record<string, string>;
};

export default function HomePage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [userPos, setUserPos] = useState(GANGNAM);
  const [sportFilter, setSportFilter] = useState("");
  const [bandFilter, setBandFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const t = useMessages<Messages>();

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
        setGyms(data);
        setLoading(false);
      });
  }, []);

  const items = useMemo(() => {
    const flat: FlatItem[] = [];
    for (const gym of gyms) {
      const dist = distanceKm(userPos.lat, userPos.lng, gym.lat, gym.lng);
      for (const activity of gym.activities) {
        for (const slot of activity.slots) {
          flat.push({ gym, activity, slot, distance: dist });
        }
      }
    }
    return flat.sort((a, b) => a.distance - b.distance);
  }, [gyms, userPos]);

  const sports = useMemo(() => {
    const set = new Set<string>();
    for (const g of gyms) for (const a of g.activities) set.add(a.sport);
    return Array.from(set).sort();
  }, [gyms]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    for (const g of gyms) if (g.area) set.add(g.area);
    return Array.from(set).sort();
  }, [gyms]);

  const MAX_DISTANCE_KM = 10;

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (item.distance > MAX_DISTANCE_KM) return false;
      if (sportFilter && item.activity.sport !== sportFilter) return false;
      if (bandFilter && item.slot.timeBand !== bandFilter) return false;
      if (areaFilter && item.gym.area !== areaFilter) return false;
      return true;
    });
  }, [items, sportFilter, bandFilter, areaFilter]);

  if (!t) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">{t.home.title}</h1>
          <p className="text-xs text-slate-500">{t.home.subtitle}</p>
        </div>
        <Link href="/map">
          <Button variant="secondary" className="text-xs">
            {t.home.toggleMap}
          </Button>
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
        >
          <option value="">{t.home.allSports}</option>
          {sports.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
        >
          <option value="">{t.home.allAreas}</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select
          value={bandFilter}
          onChange={(e) => setBandFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
        >
          <option value="">{t.home.allTimes}</option>
          <option value="OFF_PEAK">{t.timeBand.OFF_PEAK}</option>
          <option value="STANDARD">{t.timeBand.STANDARD}</option>
          <option value="PEAK">{t.timeBand.PEAK}</option>
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            {t.home.noClasses}
          </p>
        )}

        {filtered.map((item) => (
          <GymCard
            key={`${item.gym.id}-${item.slot.id}`}
            gymId={item.gym.id}
            gymName={item.gym.name}
            activityName={item.activity.name}
            distanceKm={item.distance}
            rating={item.gym.rating}
            timeBand={item.slot.timeBand}
            creditCost={item.slot.creditCost}
            startTime={item.slot.startTime}
            timeBandLabel={t.timeBand[item.slot.timeBand] ?? item.slot.timeBand}
            imageUrl={item.gym.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}
