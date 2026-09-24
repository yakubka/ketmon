"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/useMessages";

type GymPhotoCarouselProps = {
  images: string[];
  className?: string;
};

type CarouselViewProps = GymPhotoCarouselProps & {
  onImageClick?: (index: number) => void;
  onClose?: () => void;
  initialIndex?: number;
  cycleOnHover?: boolean;
  labels?: CarouselLabels;
};

type CarouselLabels = {
  previousPhoto: string;
  nextPhoto: string;
  closePhotoViewer: string;
};

type Messages = {
  detail: CarouselLabels;
};

function CarouselView({ images, className, onImageClick, onClose, initialIndex = 0, cycleOnHover = false, labels }: CarouselViewProps) {
  const [viewportRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1, startIndex: initialIndex });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const syncSelectedIndex = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    syncSelectedIndex();
    emblaApi.on("select", syncSelectedIndex);
    emblaApi.on("reInit", syncSelectedIndex);
    return () => {
      emblaApi.off("select", syncSelectedIndex);
      emblaApi.off("reInit", syncSelectedIndex);
    };
  }, [emblaApi, syncSelectedIndex]);

  const scrollPrevious = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-slate-200", className)} onMouseEnter={cycleOnHover ? scrollNext : undefined}>
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => onImageClick?.(index)}
              className={cn("min-w-0 flex-[0_0_100%]", onImageClick ? "cursor-zoom-in" : "cursor-default")}
            >
              <img src={image} alt="" className="aspect-square h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button type="button" aria-label={labels?.previousPhoto} onClick={scrollPrevious} className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur-sm transition-colors hover:bg-slate-950/80">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button type="button" aria-label={labels?.nextPhoto} onClick={scrollNext} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/60 text-white backdrop-blur-sm transition-colors hover:bg-slate-950/80">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </button>
          <div className="absolute bottom-3 left-1/2 rounded-full bg-slate-950/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </>
      )}

      {onClose && (
        <button type="button" aria-label={labels?.closePhotoViewer} onClick={onClose} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur-sm transition-colors hover:bg-slate-950">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function GymPhotoCarousel({ images, className }: GymPhotoCarouselProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const validImages = images.filter(Boolean);
  const t = useMessages<Messages>();

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  if (validImages.length === 0) return null;

  return (
    <>
      <CarouselView images={validImages} className={className} cycleOnHover labels={t?.detail} onImageClick={(index) => { setOpenIndex(index); setIsOpen(true); }} />
      {isOpen && (
        <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <CarouselView images={validImages} initialIndex={openIndex} labels={t?.detail} onClose={() => setIsOpen(false)} className="w-full max-w-2xl" />
        </div>
      )}
    </>
  );
}
