"use client";

import { useEffect } from "react";
import { Check, Eye, Palette, Type, Wind, X, Zap } from "lucide-react";
import { TEXT_SIZES, THEMES } from "@/lib/theme";
import { useAppearance } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function AppearancePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    theme,
    textSize,
    focus,
    reduceMotion,
    setTheme,
    setTextSize,
    setFocus,
    setReduceMotion,
  } = useAppearance();

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-white/10 bg-bg-elevated shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-accent" />
            <span className="text-sm font-semibold">Darstellung</span>
          </div>
          <button onClick={onClose} className="btn-ghost px-2 py-1" aria-label="Schließen">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-7 p-5">
          {/* Themes */}
          <section className="space-y-4">
            {(["dark", "light"] as const).map((mode) => (
              <div key={mode}>
                <h3 className="label">{mode === "dark" ? "Dunkle Themes" : "Helle Themes"}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.filter((t) => t.mode === mode).map((t) => {
                    const active = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3 text-left transition",
                          active
                            ? "border-accent/60 bg-accent/10"
                            : "border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                        )}
                      >
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-black/10"
                          style={{ background: t.bg }}
                        >
                          <span className="size-3.5 rounded-full" style={{ background: t.swatch }} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{t.label}</span>
                          <span className="block truncate text-xs text-zinc-500">{t.hint}</span>
                        </span>
                        {active && <Check className="ml-auto size-4 shrink-0 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>

          {/* Text size */}
          <section>
            <h3 className="label flex items-center gap-1.5">
              <Type className="size-3.5" /> Textgröße
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {TEXT_SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setTextSize(s.id)}
                  className={cn(
                    "rounded-lg border py-2 text-sm font-medium transition",
                    textSize === s.id
                      ? "border-accent/60 bg-accent/10 text-accent"
                      : "border-white/10 text-zinc-300 hover:bg-white/[0.04]"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* ADHD focus toggles */}
          <section className="space-y-2">
            <h3 className="label">Fokus-Hilfen</h3>
            <ToggleRow
              icon={<Eye className="size-4" />}
              title="Fokus-Modus"
              desc="Blendet Deko aus, schmälerer Lesebereich"
              checked={focus}
              onChange={setFocus}
            />
            <ToggleRow
              icon={<Wind className="size-4" />}
              title="Bewegung reduzieren"
              desc="Schaltet Animationen & Übergänge ab"
              checked={reduceMotion}
              onChange={setReduceMotion}
            />
          </section>

          <p className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-zinc-500">
            <Zap className="mt-0.5 size-3.5 shrink-0 text-accent" />
            Einstellungen werden auf diesem Gerät gespeichert und sofort angewendet.
          </p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-lg border border-white/10 p-3 text-left transition hover:bg-white/[0.04]"
    >
      <span className={cn("shrink-0", checked ? "text-accent" : "text-zinc-400")}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-zinc-500">{desc}</span>
      </span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition",
          checked ? "bg-accent" : "bg-white/10"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-[#fafafa] shadow transition-all",
            checked ? "left-[1.125rem]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}
