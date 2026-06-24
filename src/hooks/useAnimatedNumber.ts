import { useEffect, useRef, useState } from 'react';

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Animación de contador para montos (solo presentación). */
export function useAnimatedNumber(target: number, duration = 900): number {
  const [display, setDisplay] = useState(0);
  const valueRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = valueRef.current;
    const start = performance.now();
    const activeDuration = prefersReducedMotion ? 0 : duration;
    let frame = 0;

    const finish = (value: number) => {
      valueRef.current = value;
      setDisplay(value);
    };

    const tick = (now: number) => {
      if (activeDuration === 0) {
        finish(target);
        return;
      }

      const progress = Math.min((now - start) / activeDuration, 1);
      const next = from + (target - from) * easeOutCubic(progress);
      finish(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}
