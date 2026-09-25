"use client";

import { useMessages } from "@/lib/useMessages";

type GymDetailsInfoProps = {
  address?: string | null;
  opensAt?: string | null;
  closesAt?: string | null;
  hasTrainer: boolean;
  trainerFee?: number | null;
  hasParking: boolean;
  className?: string;
};

type Messages = {
  detail: {
    address: string;
    openHours: string;
    trainer: string;
    trainerFee: string;
    parking: string;
  };
};

export function GymDetailsInfo({ address, opensAt, closesAt, hasTrainer, trainerFee, hasParking, className }: GymDetailsInfoProps) {
  const t = useMessages<Messages>();

  if (!t) return null;

  return (
    <div className={className}>
      {address && (
        <div className="flex gap-2 text-sm text-slate-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.25 7-11.25a7 7 0 1 0-14 0C5 15.75 12 21 12 21Z" />
            <circle cx="12" cy="9.75" r="2.25" />
          </svg>
          <div><span className="font-medium text-slate-800">{t.detail.address}</span><p>{address}</p></div>
        </div>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {opensAt && closesAt && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-brand-600" aria-hidden="true">
              <circle cx="12" cy="12" r="8.25" /><path strokeLinecap="round" d="M12 7.5v4.75l3.25 1.75" />
            </svg>
            <span>{t.detail.openHours} {opensAt}&#8211;{closesAt}</span>
          </div>
        )}
        {hasTrainer && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-brand-600" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21v-1.5a4.5 4.5 0 0 1 9 0V21M12 13.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
            </svg>
            <span>{trainerFee ? `${t.detail.trainer} · ${trainerFee} ${t.detail.trainerFee}` : t.detail.trainer}</span>
          </div>
        )}
        {hasParking && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-brand-600" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 21V3.75h6.5a4.25 4.25 0 0 1 0 8.5h-6.5M6.75 12.25h6.5" />
            </svg>
            <span>{t.detail.parking}</span>
          </div>
        )}
      </div>
    </div>
  );
}
