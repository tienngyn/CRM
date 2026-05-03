import { createClient } from "@/lib/supabase/server";
import type { Deal } from "@/lib/db/types";
import { PipelineBoard } from "./board";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select("*")
    .neq("stage", "lost")
    .order("created_at", { ascending: false });

  return <PipelineBoard initialDeals={(data ?? []) as Deal[]} />;
}
