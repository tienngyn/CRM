import { createClient } from "@/lib/supabase/server";
import type { Deal } from "@/lib/db/types";
import { OutreachView } from "./outreach-view";

export const dynamic = "force-dynamic";

const DEFAULT_SCRIPT = `Guten Tag, mein Name ist [Dein Name], ich bin Webdesigner und helfe Handwerksbetrieben dabei, mehr Kunden und Bewerber über ihre Website zu gewinnen.

Ich habe mir Ihre Website kurz angeschaut und ein Detail entdeckt, das Sie täglich potenzielle [Kunden/Mitarbeiter] kosten könnte.

Darf ich das in 2 Sätzen erklären?

[Pause — Reaktion abwarten]

Hätten Sie diese Woche 15 Minuten für einen kurzen Video-Call? Ich zeige Ihnen konkret, was ich meine — ohne Verkaufsgespräch.`;

export default async function OutreachPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: deals },
    { data: settings },
    { count: todayCalls },
  ] = await Promise.all([
    supabase.from("deals").select("*").eq("stage", "cold").order("created_at", { ascending: false }),
    supabase.from("user_settings").select("*").eq("user_id", user!.id).maybeSingle(),
    supabase.from("call_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .gte("called_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  // Last call per deal
  const ids = (deals ?? []).map((d) => d.id);
  const { data: lastCalls } = ids.length
    ? await supabase
        .from("call_logs")
        .select("deal_id, called_at, outcome")
        .in("deal_id", ids)
        .order("called_at", { ascending: false })
    : { data: [] as any[] };

  const lastCallByDeal: Record<string, { called_at: string; outcome: string }> = {};
  for (const c of lastCalls ?? []) {
    if (!lastCallByDeal[c.deal_id]) lastCallByDeal[c.deal_id] = c;
  }

  return (
    <OutreachView
      initialDeals={(deals ?? []) as Deal[]}
      lastCallByDeal={lastCallByDeal}
      todayCalls={todayCalls ?? 0}
      dailyGoal={settings?.daily_call_goal ?? 30}
      script={settings?.cold_call_script ?? DEFAULT_SCRIPT}
      userId={user!.id}
    />
  );
}
