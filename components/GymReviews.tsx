"use client";

import { useEffect, useState } from "react";
import { StarIcon } from "@/components/icons/StarIcon";
import { useLocale, useMessages } from "@/lib/useMessages";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type Messages = {
  reviews: {
    title: string;
    noReviews: string;
  };
};

function relativeDate(date: string, locale: string) {
  const elapsed = new Date(date).getTime() - Date.now();
  const intervals = [
    { unit: "year" as const, milliseconds: 31536000000 },
    { unit: "month" as const, milliseconds: 2592000000 },
    { unit: "week" as const, milliseconds: 604800000 },
    { unit: "day" as const, milliseconds: 86400000 },
  ];
  const interval = intervals.find((item) => Math.abs(elapsed) >= item.milliseconds) ?? { unit: "day" as const, milliseconds: 86400000 };
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(Math.round(elapsed / interval.milliseconds), interval.unit);
}

export function GymReviews({ gymId }: { gymId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);
  const t = useMessages<Messages>();
  const locale = useLocale();

  useEffect(() => {
    let active = true;
    fetch(`/api/gyms/${gymId}/reviews`)
      .then((response) => response.json())
      .then((data: Review[]) => {
        if (active) setReviews(data);
      })
      .catch(() => {
        if (active) setReviews([]);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [gymId]);

  if (!t) return null;

  return (
    <section>
      <h2 className="text-base font-bold text-slate-900">{t.reviews.title}</h2>
      {loaded && reviews.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{t.reviews.noReviews}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">{review.authorName}</p>
                <time dateTime={review.createdAt} className="text-xs text-slate-400">{relativeDate(review.createdAt, locale)}</time>
              </div>
              <div className="mt-1 flex items-center gap-1 text-amber-400">
                <StarIcon />
                <span className="text-xs font-semibold text-slate-600">{review.rating.toFixed(1)}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
