// Theme + appearance preferences shared between the provider, the
// appearance panel and the no-FOUC bootstrap script.

export type ThemeId =
  | "crimson"
  | "ocean"
  | "forest"
  | "violet"
  | "amber"
  | "slate"
  | "contrast";

export type TextSize = "100" | "112" | "125";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  hint: string;
  /** CSS color used for the swatch in the picker. */
  swatch: string;
  /** Background tint shown behind the swatch. */
  bg: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "crimson", label: "Crimson", hint: "Standard", swatch: "rgb(239 68 68)", bg: "rgb(17 17 17)" },
  { id: "ocean", label: "Ocean", hint: "Ruhig", swatch: "rgb(56 152 236)", bg: "rgb(9 14 20)" },
  { id: "forest", label: "Forest", hint: "Ruhig", swatch: "rgb(52 199 123)", bg: "rgb(10 17 14)" },
  { id: "violet", label: "Violet", hint: "Kreativ", swatch: "rgb(167 122 255)", bg: "rgb(16 13 22)" },
  { id: "amber", label: "Amber", hint: "Warm", swatch: "rgb(245 173 63)", bg: "rgb(20 16 10)" },
  { id: "slate", label: "Slate", hint: "Reizarm", swatch: "rgb(148 163 184)", bg: "rgb(15 18 22)" },
  { id: "contrast", label: "Kontrast", hint: "Maximal lesbar", swatch: "rgb(255 255 255)", bg: "rgb(0 0 0)" },
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
