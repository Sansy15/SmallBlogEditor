/**
 * Custom debounce hook - demonstrates DSA understanding.
 * Delays invoking a function until after wait ms have elapsed since the last call.
 * Used for auto-save: we don't spam the API on every keystroke.
 */
import { useEffect, useRef, useCallback } from 'react';

export function useDebounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T {
  const fnRef = useRef(fn);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  fnRef.current = fn;

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        fnRef.current(...(lastArgsRef.current ?? []));
        timeoutRef.current = null;
        lastArgsRef.current = null;
      }, delay);
    },
    [delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return debouncedFn;
}
