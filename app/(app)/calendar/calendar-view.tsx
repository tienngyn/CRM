"use client";

import { useState } from "react";
import Link from "next/link";
import type { Deal } from "@/lib/db/types";
import { STAGES, fmtEur, cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Phone, Clock } from "lucide-react";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday-based week (0=Mo … 6=So)
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  // Pad to full weeks
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export function CalendarView({ deals }: { deals: Deal[] }) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<Date>(today);

  const days = getCalendarDays(current.year, current.month);

  function prev() {
    setCurrent(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  }
  function next() {
    setCurrent(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  }

  function dealsOnDay(day: Date) {
    return deals.filter((d) => d.discovery_at && isSameDay(new Date(d.discovery_at), day));
  }

  const selectedDeals = dealsOnDay(selected);

  // Upcoming (all future deals sorted)
  const upcoming = deals
    .filter((d) => d.discovery_at && new Date(d.discovery_at) >= today)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kalender</h1>
        <p className="mt-1 text-sm text-zinc-400">Discovery Calls &amp; Termine</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar grid */}
        <div className="card p-6">
          {/* Month navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button onClick={prev} className="btn-ghost p-2"><ChevronLeft className="size-5" /></button>
            <h2 className="text-base font-semibold">
              {MONTHS[current.month]} {current.year}
            </h2>
            <button onClick={next} className="btn-ghost p-2"><ChevronRight className="size-5" /></button>
          </div>

          {/* Weekday headers */}
          <div className="mb-2 grid grid-cols-7 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const dayDeals = dealsOnDay(day);
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selected);
              const hasDeals = dayDeals.length > 0;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelected(day)}
                  className={cn(
                    "relative flex min-h-[52px] flex-col items-center rounded-lg p-1.5 text-sm transition",
                    isSelected && "bg-accent/15 ring-1 ring-accent/50",
                    !isSelected && isToday && "ring-1 ring-white/20",
                    !isSelected && !isToday && "hover:bg-white/[0.04]",
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium",
                    isToday && !isSelected && "text-accent",
                    isSelected && "text-accent font-semibold",
                    !isToday && !isSelected && "text-zinc-300",
                  )}>
                    {day.getDate()}
                  </span>
                  {hasDeals && (
                    <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                      {dayDeals.slice(0, 3).map((d) => (
                        <div key={d.id} className="size-1.5 rounded-full bg-accent" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day deals */}
          <div className="mt-6 border-t border-white/5 pt-5">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
              {selected.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            {selectedDeals.length === 0 ? (
              <p className="text-sm text-zinc-500">Keine Termine an diesem Tag.</p>
            ) : (
              <div className="space-y-2">
                {selectedDeals.map((d) => (
                  <Link
                    key={d.id}
                    href={`/deals/${d.id}`}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-white/20 transition"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Clock className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{d.company}</div>
                      <div className="text-xs text-zinc-500">{d.contact_name ?? "—"}</div>
                    </div>
                    <span className="text-xs font-semibold text-accent shrink-0">
                      {fmtTime(d.discovery_at!)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-400">
              Nächste Termine
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-zinc-500">Keine anstehenden Termine.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((d) => {
                  const dt = new Date(d.discovery_at!);
                  const isUpcomingToday = isSameDay(dt, today);
                  return (
                    <Link
                      key={d.id}
                      href={`/deals/${d.id}`}
                      className="block rounded-lg border border-white/10 bg-white/[0.02] p-3 transition hover:border-white/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{d.company}</div>
                          <div className="mt-0.5 text-xs text-zinc-500">{d.contact_name ?? "—"}</div>
                        </div>
                        <span className={cn(
                          "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          isUpcomingToday
                            ? "border-accent/40 bg-accent/10 text-accent"
                            : "border-white/10 bg-white/[0.03] text-zinc-400"
                        )}>
                          {isUpcomingToday ? "Heute" : dt.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><Clock className="size-3" />{fmtTime(d.discovery_at!)}</span>
                        {d.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{d.phone}</span>}
                      </div>
                      {d.deal_value && (
                        <div className="mt-1 text-xs text-accent">{fmtEur(d.deal_value)}</div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
