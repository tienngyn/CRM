import { createClient } from "@/lib/supabase/server";
import { fmtEur, fmtDate, fmtDateTime, STAGES, DAILY_CALL_GOAL } from "@/lib/utils";
import Link from "next/link";
import type { Deal } from "@/lib/db/types";
import { ArrowRight, AlertCircle, Calendar, Euro, PhoneCall, Target, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .order("next_action_at", { ascending: true, nullsFirst: false });

  const all = (deals ?? []) as Deal[];
  const open = all.filter((d) => (d.stage as string) !== "lost" && d.stage !== "active");
  const pipelineValue = open.reduce((s, d) => s + (d.deal_value ?? 0), 0);

  // Today's call count
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count: todayCalls } = await supabase
    .from("call_logs")
    .select("*", { count: "exact", head: true })
    .gte("called_at", startOfDay.toISOString());

  // Today + upcoming discovery meetings (next 7 days)
  const in7 = new Date();
  in7.setDate(in7.getDate() + 7);
  const upcomingMeetings = all
    .filter((d) => d.discovery_at && new Date(d.discovery_at) >= startOfDay && new Date(d.discovery_at) <= in7)
    .sort((a, b) => new Date(a.discovery_at!).getTime() - new Date(b.discovery_at!).getTime());

  const now = new Date();
  const overdueFollowUps = all.filter(
    (d) => d.next_action_at && new Date(d.next_action_at) < now && (d.stage as string) !== "lost"
  );

  const nextActions = all
    .filter((d) => d.next_action_at && new Date(d.next_action_at) >= now && (d.stage as string) !== "lost")
    .slice(0, 5);

  const closingDeals = all.filter((d) => d.stage === "closing");
  const { data: contracts } = await supabase
    .from("contracts")
    .select("deal_id, deposit_paid_at")
    .in("deal_id", closingDeals.length ? closingDeals.map((d) => d.id) : ["00000000-0000-0000-0000-000000000000"]);
  const pendingDeposits = (contracts ?? []).filter((c) => !c.deposit_paid_at).length;

  const callPct = Math.min(100, Math.round(((todayCalls ?? 0) / DAILY_CALL_GOAL) * 100));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Dein Vertriebsprozess auf einen Blick.</p>
      </div>

      {/* Daily Call Goal */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Target className="size-4 text-accent" />
              <span className="text-xs uppercase tracking-wider">Tagesziel Cold Calls</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight">{todayCalls ?? 0}</span>
              <span className="text-lg text-zinc-500">/ {DAILY_CALL_GOAL}</span>
            </div>
          </div>
          <Link href="/leads" className="btn-primary">
            <PhoneCall className="size-4" /> Calls starten
          </Link>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${callPct}%`, boxShadow: callPct >= 100 ? "0 0 20px rgba(239,68,68,0.5)" : undefined }}
          />
        </div>
        {callPct >= 100 && (
          <p className="mt-3 text-xs text-emerald-400">🔥 Tagesziel erreicht. Weiter so.</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat icon={<Euro className="size-4" />} label="Pipeline-Wert" value={fmtEur(pipelineValue)} />
        <Stat icon={<Calendar className="size-4" />} label="Offene Deals" value={String(open.length)} />
        <Stat icon={<AlertCircle className="size-4" />} label="Offene Anzahlungen" value={String(pendingDeposits)} />
      </div>

      {/* Upcoming Meetings */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
          Anstehende Termine (7 Tage)
        </h2>
        <div className="card divide-y divide-white/5">
          {upcomingMeetings.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">Keine Termine geplant.</div>
          ) : (
            upcomingMeetings.map((d) => (
              <Link
                key={d.id}
                href={`/deals/${d.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <div className="font-medium">{d.company}</div>
                    <div className="text-xs text-zinc-500">
                      {d.contact_name ?? "—"} · Discovery Call
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium text-accent">{fmtDateTime(d.discovery_at)}</span>
                  <ArrowRight className="size-4 text-zinc-600" />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
          Pipeline-Verteilung
        </h2>
        <div className="grid gap-3 md:grid-cols-6">
          {STAGES.map((s) => {
            const count = all.filter((d) => d.stage === s.id).length;
            return (
              <Link key={s.id} href="/pipeline" className="card card-hover p-4">
                <div className="text-xs uppercase tracking-wider text-zinc-500">{s.label}</div>
                <div className="mt-2 text-2xl font-semibold">{count}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {overdueFollowUps.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-accent">
            <Bell className="size-4" /> Überfällige Follow-ups ({overdueFollowUps.length})
          </h2>
          <div className="card divide-y divide-white/5 border-accent/20">
            {overdueFollowUps.map((d) => (
              <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02]">
                <div>
                  <div className="font-medium text-white">{d.company}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {(d as any).follow_up_note ?? d.contact_name ?? "—"}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-accent">
                  <span>{fmtDate(d.next_action_at)}</span>
                  <ArrowRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
          Nächste Aktionen
        </h2>
        <div className="card divide-y divide-white/5">
          {nextActions.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">Keine geplanten Aktionen.</div>
          ) : (
            nextActions.map((d) => (
              <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02]">
                <div>
                  <div className="font-medium">{d.company}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {d.contact_name ?? "—"} · <span className="badge ml-1">{STAGES.find((s) => s.id === d.stage)?.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span>{fmtDate(d.next_action_at)}</span>
                  <ArrowRight className="size-4 text-zinc-600" />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-zinc-400">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
