'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ColorblindMode = 'normal' | 'deuteranopia' | 'protanopia' | 'tritanopia';

interface ColorblindContextType {
  colorblindMode: ColorblindMode;
  isColorblindMode: boolean;
  toggleColorblind: () => void;
  setColorblindMode: (mode: ColorblindMode) => void;
}

const ColorblindContext = createContext<ColorblindContextType>({
  colorblindMode: 'normal',
  isColorblindMode: false,
  toggleColorblind: () => {},
  setColorblindMode: () => {},
});

const STORAGE_KEY = 'netra_colorblind_mode';

export function ColorblindProvider({ children }: { children: React.ReactNode }) {
  const [colorblindMode, setColorblindMode] = useState<ColorblindMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'deuteranopia' || stored === 'protanopia' || stored === 'tritanopia' ? stored : 'normal';
    }
    return 'normal';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, colorblindMode);
    document.documentElement.setAttribute('data-colorblind', colorblindMode);
  }, [colorblindMode]);

  const toggleColorblind = useCallback(() => {
    setColorblindMode((prev) => (prev === 'normal' ? 'deuteranopia' : 'normal'));
  }, []);

  return (
    <ColorblindContext.Provider value={{ colorblindMode, isColorblindMode: colorblindMode !== 'normal', toggleColorblind, setColorblindMode }}>
      {children}
    </ColorblindContext.Provider>
  );
}

export function useColorblind() {
  return useContext(ColorblindContext);
}
