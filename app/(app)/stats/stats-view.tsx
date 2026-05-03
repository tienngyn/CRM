"use client";

import { STAGES, CALL_OUTCOMES, fmtEur, cn } from "@/lib/utils";

type Deal = { stage: string; deal_value: number | null; created_at: string };
type Call = { outcome: string; called_at: string };

function Bar({ pct, color = "bg-accent" }: { pct: number; color?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/5">
      <div className={cn("h-full transition-all", color)} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}

export function StatsView({ deals, allCalls, recentCalls }: {
  deals: Deal[];
  allCalls: Call[];
  recentCalls: Call[];
}) {
  const today = new Date(); today.setHours(0,0,0,0);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

  const callsToday = allCalls.filter((c) => new Date(c.called_at) >= today).length;
  const callsWeek = allCalls.filter((c) => new Date(c.called_at) >= weekAgo).length;
  const callsTotal = allCalls.length;

  const scheduled = allCalls.filter((c) => c.outcome === "scheduled").length;
  const convRate = callsTotal > 0 ? ((scheduled / callsTotal) * 100).toFixed(1) : "0";

  const pipelineValue = deals
    .filter((d) => !["lost", "active"].includes(d.stage))
    .reduce((s, d) => s + (d.deal_value ?? 0), 0);

  const wonValue = deals
    .filter((d) => d.stage === "active")
    .reduce((s, d) => s + (d.deal_value ?? 0), 0);

  // Outcome breakdown (last 30 days)
  const outcomeCounts = CALL_OUTCOMES.map((o) => ({
    ...o,
    count: recentCalls.filter((c) => c.outcome === o.id).length,
  }));
  const maxOutcome = Math.max(...outcomeCounts.map((o) => o.count), 1);

  // Calls per day (last 14 days)
  const days14: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    days14.push({
      date: d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric" }),
      count: allCalls.filter((c) => {
        const t = new Date(c.called_at);
        return t >= d && t < next;
      }).length,
    });
  }
  const maxDay = Math.max(...days14.map((d) => d.count), 1);

  // Funnel
  const funnelStages = STAGES.filter((s) => s.id !== "active");
  const stageCounts = funnelStages.map((s) => ({
    ...s,
    count: deals.filter((d) => d.stage === s.id).length,
    value: deals.filter((d) => d.stage === s.id).reduce((acc, d) => acc + (d.deal_value ?? 0), 0),
  }));
  const maxStageCount = Math.max(...stageCounts.map((s) => s.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Statistiken</h1>
        <p className="mt-1 text-sm text-zinc-400">Dein Vertrieb auf einen Blick.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Calls heute" value={String(callsToday)} sub="Ziel: 30" />
        <StatCard label="Calls letzte 7 Tage" value={String(callsWeek)} />
        <StatCard label="Terminquote" value={`${convRate}%`} sub={`${scheduled} von ${callsTotal} Calls`} />
        <StatCard label="Pipeline-Wert" value={fmtEur(pipelineValue)} sub={`Gewonnen: ${fmtEur(wonValue)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calls pro Tag */}
        <div className="card p-6">
          <h2 className="mb-5 text-xs font-medium uppercase tracking-wider text-zinc-400">Calls pro Tag (14 Tage)</h2>
          <div className="flex h-40 items-end gap-1.5">
            {days14.map((d, i) => (
              <div key={i} className="group flex flex-1 flex-col items-center gap-1">
                <div className="relative w-full">
                  <div
                    className="w-full rounded-t bg-accent/80 transition-all group-hover:bg-accent"
                    style={{ height: `${Math.max(4, (d.count / maxDay) * 140)}px` }}
                  />
                  {d.count > 0 && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-zinc-600 rotate-45 origin-left mt-1">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome-Verteilung */}
        <div className="card p-6">
          <h2 className="mb-5 text-xs font-medium uppercase tracking-wider text-zinc-400">Call-Ergebnisse (30 Tage)</h2>
          <div className="space-y-3">
            {outcomeCounts.map((o) => (
              <div key={o.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-zinc-300">{o.label}</span>
                  <span className="font-medium text-white">{o.count}</span>
                </div>
                <Bar
                  pct={(o.count / maxOutcome) * 100}
                  color={
                    o.id === "scheduled" ? "bg-emerald-500" :
                                        o.id === "callback" ? "bg-amber-500" :
                    o.id === "not_interested" ? "bg-red-500/60" :
                    "bg-zinc-600"
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Funnel */}
      <div className="card p-6">
        <h2 className="mb-5 text-xs font-medium uppercase tracking-wider text-zinc-400">Pipeline Funnel</h2>
        <div className="space-y-3">
          {stageCounts.map((s, i) => (
            <div key={s.id} className="flex items-center gap-4">
              <div className="w-20 shrink-0 text-xs text-zinc-400">{s.label}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Bar pct={(s.count / maxStageCount) * 100} />
                  </div>
                  <div className="w-6 shrink-0 text-right text-sm font-semibold text-white">{s.count}</div>
                  <div className="w-24 shrink-0 text-right text-xs text-accent">{s.value > 0 ? fmtEur(s.value) : "—"}</div>
                </div>
              </div>
              {i < stageCounts.length - 1 && stageCounts[i].count > 0 && (
                <div className="w-12 shrink-0 text-right text-[10px] text-zinc-500">
                  {Math.round((stageCounts[i + 1].count / stageCounts[i].count) * 100)}%
                </div>
              )}
              {(i >= stageCounts.length - 1 || stageCounts[i].count === 0) && <div className="w-12 shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
