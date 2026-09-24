"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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
};

export default function MapPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);

  useEffect(() => {
    fetch("/api/gyms")
      .then((r) => r.json())
      .then(setGyms);
  }, []);

  return (
    <div className="relative h-screen w-full">
      <div className="absolute left-4 top-4 z-[1000]">
        <Link href="/home">
          <Button variant="secondary" className="text-xs">
            List
          </Button>
        </Link>
      </div>
      <MapContent gyms={gyms} />
    </div>
  );
}
