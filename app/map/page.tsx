"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/useMessages";

const MapContent = dynamic(() => import("@/components/MapContent"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  ),
});

type Gym = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  imageUrl: string | null;
};

type Messages = {
  home: { toggleList: string };
};

export default function MapPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const t = useMessages<Messages>();

  useEffect(() => {
    fetch("/api/gyms")
      .then((r) => r.json())
      .then(setGyms);
  }, []);

  return (
    <div className="relative h-screen w-full">
      <div className="absolute right-4 top-4 z-[1000]">
        <Link href="/home" aria-label={t?.home.toggleList ?? "List"}>
          <Button variant="secondary" className="flex h-11 w-11 items-center justify-center !rounded-full !p-0 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Button>
        </Link>
      </div>
      <MapContent gyms={gyms} />
    </div>
  );
}
