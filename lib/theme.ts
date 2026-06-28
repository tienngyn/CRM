// Theme + appearance preferences shared between the provider, the
// appearance panel and the no-FOUC bootstrap script.

export type ThemeId =
  | "crimson"
  | "ocean"
  | "forest"
  | "violet"
  | "amber"
  | "slate"
  | "contrast"
  | "daylight"
  | "sand"
  | "mint";

export type TextSize = "100" | "112" | "125";

export type ThemeMode = "dark" | "light";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  hint: string;
  mode: ThemeMode;
  /** CSS color used for the swatch in the picker. */
  swatch: string;
  /** Background tint shown behind the swatch. */
  bg: string;
}

export const THEMES: ThemeMeta[] = [
  // Dark
  { id: "crimson", label: "Crimson", hint: "Standard", mode: "dark", swatch: "rgb(239 68 68)", bg: "rgb(17 17 17)" },
  { id: "ocean", label: "Ocean", hint: "Ruhig", mode: "dark", swatch: "rgb(56 152 236)", bg: "rgb(9 14 20)" },
  { id: "forest", label: "Forest", hint: "Ruhig", mode: "dark", swatch: "rgb(52 199 123)", bg: "rgb(10 17 14)" },
  { id: "violet", label: "Violet", hint: "Kreativ", mode: "dark", swatch: "rgb(167 122 255)", bg: "rgb(16 13 22)" },
  { id: "amber", label: "Amber", hint: "Warm", mode: "dark", swatch: "rgb(245 173 63)", bg: "rgb(20 16 10)" },
  { id: "slate", label: "Slate", hint: "Reizarm", mode: "dark", swatch: "rgb(148 163 184)", bg: "rgb(15 18 22)" },
  { id: "contrast", label: "Kontrast", hint: "Maximal lesbar", mode: "dark", swatch: "rgb(255 255 255)", bg: "rgb(0 0 0)" },
  // Light
  { id: "daylight", label: "Daylight", hint: "Klar & hell", mode: "light", swatch: "rgb(37 99 235)", bg: "rgb(250 250 251)" },
  { id: "sand", label: "Sand", hint: "Warm, reizarm", mode: "light", swatch: "rgb(201 91 60)", bg: "rgb(247 244 239)" },
  { id: "mint", label: "Mint", hint: "Ruhig & hell", mode: "light", swatch: "rgb(5 150 105)", bg: "rgb(246 250 248)" },
];

export const DEFAULT_THEME: ThemeId = "crimson";

export const STORAGE_KEYS = {
  theme: "salesos-theme",
  textSize: "salesos-textsize",
  focus: "salesos-focus",
  motion: "salesos-motion",
} as const;

export const TEXT_SIZES: { id: TextSize; label: string }[] = [
  { id: "100", label: "Normal" },
  { id: "112", label: "Groß" },
  { id: "125", label: "Größer" },
];

// Inlined into <head> so preferences apply before first paint (no flash).
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{
var d=document.documentElement,k=${JSON.stringify(STORAGE_KEYS)};
d.setAttribute('data-theme',localStorage.getItem(k.theme)||'${DEFAULT_THEME}');
d.style.setProperty('--font-scale',(localStorage.getItem(k.textSize)||'100')+'%');
if(localStorage.getItem(k.focus)==='1')d.classList.add('focus-mode');
if(localStorage.getItem(k.motion)==='reduce')d.classList.add('reduce-motion');
}catch(e){}})();`;
