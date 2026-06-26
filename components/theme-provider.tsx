"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  STORAGE_KEYS,
  type TextSize,
  type ThemeId,
} from "@/lib/theme";

interface AppearanceState {
  theme: ThemeId;
  textSize: TextSize;
  focus: boolean;
  reduceMotion: boolean;
  setTheme: (t: ThemeId) => void;
  setTextSize: (s: TextSize) => void;
  setFocus: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
}

const AppearanceContext = createContext<AppearanceState | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [textSize, setTextSizeState] = useState<TextSize>("100");
  const [focus, setFocusState] = useState(false);
  const [reduceMotion, setReduceMotionState] = useState(false);

  // Hydrate from what the bootstrap script already applied to <html>.
  useEffect(() => {
    const d = document.documentElement;
    setThemeState((d.getAttribute("data-theme") as ThemeId) || DEFAULT_THEME);
    setTextSizeState(
      ((localStorage.getItem(STORAGE_KEYS.textSize) as TextSize) || "100")
    );
    setFocusState(d.classList.contains("focus-mode"));
    setReduceMotionState(d.classList.contains("reduce-motion"));
  }, []);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(STORAGE_KEYS.theme, t);
  }, []);

  const setTextSize = useCallback((s: TextSize) => {
    setTextSizeState(s);
    document.documentElement.style.setProperty("--font-scale", `${s}%`);
    localStorage.setItem(STORAGE_KEYS.textSize, s);
  }, []);

  const setFocus = useCallback((v: boolean) => {
    setFocusState(v);
    document.documentElement.classList.toggle("focus-mode", v);
    localStorage.setItem(STORAGE_KEYS.focus, v ? "1" : "0");
  }, []);

  const setReduceMotion = useCallback((v: boolean) => {
    setReduceMotionState(v);
    document.documentElement.classList.toggle("reduce-motion", v);
    localStorage.setItem(STORAGE_KEYS.motion, v ? "reduce" : "normal");
  }, []);

  return (
    <AppearanceContext.Provider
      value={{
        theme,
        textSize,
        focus,
        reduceMotion,
        setTheme,
        setTextSize,
        setFocus,
        setReduceMotion,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance must be used within ThemeProvider");
  return ctx;
}
