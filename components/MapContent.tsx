"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type Gym = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
};

export default function MapContent({ gyms }: { gyms: Gym[] }) {
  return (
    <MapContainer
      center={[37.4979, 127.0276]}
      zoom={14}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {gyms.map((gym) => (
        <Marker key={gym.id} position={[gym.lat, gym.lng]} icon={icon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{gym.name}</p>
              <p className="text-slate-500">&#9733; {gym.rating.toFixed(1)}</p>
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
