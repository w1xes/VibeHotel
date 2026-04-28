import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function PropertyGallery({ images, title }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1)), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1)), [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, prev, next]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] md:aspect-[2/1] rounded-2xl bg-muted flex items-center justify-center text-text-muted">
        No photos available
      </div>
    );
  }

  return (
    <>
      {/* ── Gallery card ── */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="aspect-[16/9] md:aspect-[2/1]">
          <img
            src={images[current]}
            alt={`${title} — photo ${current + 1}`}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Fullscreen button */}
        <button
          onClick={() => setLightbox(true)}
          className="absolute top-3 right-3 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60 transition cursor-pointer"
          aria-label="Open fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur-sm hover:bg-white transition cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur-sm hover:bg-white transition cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors cursor-pointer',
                idx === current ? 'bg-white' : 'bg-white/50'
              )}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Lightbox overlay ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          {/* Image — stop propagation so clicking the image itself doesn't close */}
          <img
            src={images[current]}
            alt={`${title} — photo ${current + 1}`}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/25 transition cursor-pointer"
            aria-label="Close fullscreen"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter */}
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-sm select-none">
            {current + 1} / {images.length}
          </span>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Thumbnail strip */}
              <div
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={cn(
                      'h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition cursor-pointer',
                      idx === current ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
