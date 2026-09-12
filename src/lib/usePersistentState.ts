import { useEffect, useState } from 'react';

/** useState that remembers its value in localStorage, falling back quietly when storage is unavailable. */
export function usePersistentState<T extends string>(key: string, initial: T, allowed: readonly T[]) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key) as T | null;
      return stored && allowed.includes(stored) ? stored : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, value); } catch { /* storage blocked */ }
  }, [key, value]);

  return [value, setValue] as const;
}
