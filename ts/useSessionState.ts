import {useState, useEffect, useCallback, Dispatch, SetStateAction} from 'react';

/**
 * Like useState, but persists to sessionStorage.
 * Value survives page reloads but not new tabs/sessions.
 */
export function useSessionState<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValueInternal] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors (quota exceeded, etc.)
    }
  }, [key, value]);

  const setValue = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    setValueInternal((prev) => {
      const next = typeof action === 'function' ? (action as (prev: T) => T)(prev) : action;
      return next;
    });
  }, []);

  return [value, setValue];
}
