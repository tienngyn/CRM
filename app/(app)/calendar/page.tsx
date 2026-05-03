import { createClient } from "@/lib/supabase/server";
import type { Deal } from "@/lib/db/types";
import { CalendarView } from "./calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();

  // Fetch all deals that have a discovery_at set
  const { data } = await supabase
    .from("deals")
    .select("id, company, contact_name, stage, discovery_at, deal_value, phone, email")
    .not("discovery_at", "is", null)
    .order("discovery_at", { ascending: true });

  return <CalendarView deals={(data ?? []) as Deal[]} />;
}
