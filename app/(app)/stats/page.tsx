import { createClient } from "@/lib/supabase/server";
import { StatsView } from "./stats-view";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const startOfToday = new Date(now); startOfToday.setHours(0,0,0,0);
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
  const startOf30 = new Date(now); startOf30.setDate(now.getDate() - 30);

  const [
    { data: deals },
    { data: allCalls },
    { data: recentCalls },
  ] = await Promise.all([
    supabase.from("deals").select("stage, deal_value, created_at"),
    supabase.from("call_logs").select("outcome, called_at").eq("user_id", user!.id).order("called_at", { ascending: true }),
    supabase.from("call_logs").select("outcome, called_at").eq("user_id", user!.id).gte("called_at", startOf30.toISOString()),
  ]);

  return (
    <StatsView
      deals={deals ?? []}
      allCalls={allCalls ?? []}
      recentCalls={recentCalls ?? []}
    />
  );
}
