"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
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

export default function MapContent({ gyms }: { gyms: Gym[] }) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

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
