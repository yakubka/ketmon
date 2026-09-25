"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from "react-leaflet";
import { useEffect, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { StarIcon } from "@/components/icons/StarIcon";
import { GymImage } from "@/components/GymImage";

const icon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "hue-rotate-[200deg] brightness-150",
});

type Gym = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  imageUrl: string | null;
};

type RouteInfo = {
  coords: [number, number][];
  distanceKm: number;
  durationMin: number;
};

function UserLocationMarker({ onLocation }: { onLocation: (pos: [number, number]) => void }) {
  const map = useMap();

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        onLocation(latlng);
        map.setView(latlng, 14);
      },
      () => {},
    );
  }, [map, onLocation]);

  return null;
}

async function fetchRoute(from: [number, number], to: [number, number]): Promise<RouteInfo | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes?.length) return null;

    const route = data.routes[0];
    const coords = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] as [number, number],
    );
    return {
      coords,
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}

export default function MapContent({ gyms }: { gyms: Gym[] }) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeTarget, setRouteTarget] = useState<string | null>(null);

  async function handleRoute(gym: Gym) {
    if (!userPos) return;
    if (routeTarget === gym.id) {
      setRoute(null);
      setRouteTarget(null);
      return;
    }
    const r = await fetchRoute(userPos, [gym.lat, gym.lng]);
    setRoute(r);
    setRouteTarget(gym.id);
  }

  return (
    <MapContainer
      center={[37.4106, 126.6784]}
      zoom={14}
      zoomControl={false}
      className="h-full w-full"
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <UserLocationMarker onLocation={setUserPos} />
      {userPos && (
        <Marker position={userPos} icon={userIcon}>
          <Popup>
            <p className="text-sm font-semibold">You</p>
          </Popup>
        </Marker>
      )}
      {route && <Polyline positions={route.coords} color="#14b8a6" weight={4} opacity={0.8} />}
      {gyms.map((gym) => (
        <Marker key={gym.id} position={[gym.lat, gym.lng]} icon={icon}>
          <Popup>
            <div className="text-sm">
              <GymImage
                src={gym.imageUrl}
                alt={gym.name}
                sport="gym"
                className="mb-1.5 h-20 w-full rounded-md object-cover"
              />
              <p className="font-semibold">{gym.name}</p>
              <p className="flex items-center gap-1 text-slate-500">
                <StarIcon className="h-3 w-3 text-amber-400" />
                {gym.rating.toFixed(1)}
              </p>
              {userPos && (
                <button
                  onClick={() => handleRoute(gym)}
                  className="mt-1 rounded bg-teal-500 px-2 py-0.5 text-xs text-white"
                >
                  {routeTarget === gym.id ? "Hide Route" : "Route"}
                </button>
              )}
              {route && routeTarget === gym.id && (
                <p className="mt-1 text-xs text-slate-500">
                  {route.distanceKm} km, ~{route.durationMin} min walk
                </p>
              )}
              <Link
                href={`/gym/${gym.id}`}
                className="mt-1 inline-block text-brand-600 underline"
              >
                Details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
