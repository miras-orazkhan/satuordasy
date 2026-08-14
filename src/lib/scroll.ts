'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Scrolls to an element by id, WITHOUT changing the URL hash.
 * Used to satisfy the requirement: no anchor (#) links for in-page navigation.
 *
 * Usage:
 *   <button onClick={() => scrollToId('leads')}>Go to form</button>
 *   <section id="leads">...</section>
 */
export function scrollToId(id: string) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Move focus for accessibility, but do NOT add a hash
  setTimeout(() => {
    el.focus?.({ preventScroll: true });
  }, 400);
}

/**
 * Initializer that checks prefers-reduced-motion ON THE CLIENT.
 * Runs once at first render — used as initial useState value to avoid setState in effect.
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns a ref + boolean indicating whether the element is in view.
 * If user prefers reduced motion — the element is immediately considered "in view"
 * (so no transition is triggered).
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);
  // Initialize based on reduced-motion preference so we don't setState synchronously in effect.
  const [inView, setInView] = useState<boolean>(() => prefersReducedMotion());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // If user prefers reduced motion — already inView=true, nothing to do
    if (prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          // Defer the state update via microtask to avoid synchronous setState in effect
          queueMicrotask(() => setInView(true));
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
        ...options,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}
