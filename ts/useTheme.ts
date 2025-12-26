import {useEffect} from 'react';
import {useSessionState} from './useSessionState';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useSessionState<Theme>('theme', 'system');

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let effective: 'light' | 'dark';
      if (theme === 'system') {
        effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        effective = theme;
      }
      root.setAttribute('data-theme', effective);
    };

    applyTheme();

    // Listen for system preference changes when in system mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  const cycleTheme = () => {
    setTheme(t => {
      switch (t) {
        case 'light': return 'dark';
        case 'dark': return 'system';
        case 'system': return 'light';
      }
    });
  };

  return {theme, setTheme, cycleTheme};
}
