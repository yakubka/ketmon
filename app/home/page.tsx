"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarIcon } from "@/components/icons/StarIcon";
import { distanceKm } from "@/lib/distance";
import { useMessages } from "@/lib/useMessages";
import Link from "next/link";

const GANGNAM = { lat: 37.4979, lng: 127.0276 };

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
};

const DISTANCE_OPTIONS = [
  { value: 0, label: "All" },
  { value: 3, label: "3 km" },
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
];

export default function HomePage() {
  const [gyms, setGyms] = useState<GymSummary[]>([]);
  const [userPos, setUserPos] = useState(GANGNAM);
  const [sportFilter, setSportFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [distanceFilter, setDistanceFilter] = useState(0);
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

  const gymsWithDistance = useMemo(() => {
    return gyms.map((g) => ({
      ...g,
      distance: distanceKm(userPos.lat, userPos.lng, g.lat, g.lng),
    })).sort((a, b) => a.distance - b.distance);
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

  const filtered = useMemo(() => {
    return gymsWithDistance.filter((g) => {
      if (distanceFilter > 0 && g.distance > distanceFilter) return false;
      if (sportFilter && !g.sports.includes(sportFilter)) return false;
      if (areaFilter && g.area !== areaFilter) return false;
      return true;
    });
  }, [gymsWithDistance, sportFilter, areaFilter, distanceFilter]);

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
          value={distanceFilter}
          onChange={(e) => setDistanceFilter(Number(e.target.value))}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
        >
          {DISTANCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            {t.home.noClasses}
          </p>
        )}

        {filtered.map((gym) => (
          <Link key={gym.id} href={`/gym/${gym.id}`}>
            <Card className="flex gap-3 p-3 transition-shadow hover:shadow-md">
              {gym.imageUrl && (
                <img
                  src={gym.imageUrl}
                  alt={gym.name}
                  className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-900">{gym.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  <StarIcon className="inline h-3 w-3 text-amber-400" /> {gym.rating.toFixed(1)}
                  {gym.area && ` · ${gym.area}`}
                  {` · ${gym.distance.toFixed(1)} km`}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {gym.sports.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] text-teal-700">
                      {s}
                    </span>
                  ))}
                  {gym.sports.length > 3 && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                      +{gym.sports.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
