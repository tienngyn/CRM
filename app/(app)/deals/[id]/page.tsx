import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Deal, DiscoveryNote, Proposal, Contract, Kickoff, Activity, CallLog } from "@/lib/db/types";
import { DealView } from "./view";

export const dynamic = "force-dynamic";

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: deal } = await supabase.from("deals").select("*").eq("id", id).single();
  if (!deal) notFound();

  const [
    { data: discovery },
    { data: proposal },
    { data: contract },
    { data: kickoff },
    { data: activities },
    { data: calls },
    { data: settings },
    { data: notes },
  ] = await Promise.all([
    supabase.from("discovery_notes").select("*").eq("deal_id", id).maybeSingle(),
    supabase.from("proposals").select("*").eq("deal_id", id).maybeSingle(),
    supabase.from("contracts").select("*").eq("deal_id", id).maybeSingle(),
    supabase.from("kickoffs").select("*").eq("deal_id", id).maybeSingle(),
    supabase.from("activities").select("*").eq("deal_id", id).neq("type", "note").order("created_at", { ascending: false }),
    supabase.from("call_logs").select("*").eq("deal_id", id).order("called_at", { ascending: false }),
    supabase.from("user_settings").select("cold_call_script").eq("user_id", user!.id).maybeSingle(),
    supabase.from("activities").select("*").eq("deal_id", id).eq("type", "note").order("created_at", { ascending: false }),
  ]);

  return (
    <DealView
      deal={deal as Deal}
      discovery={(discovery as DiscoveryNote) ?? null}
      proposal={(proposal as Proposal) ?? null}
      contract={(contract as Contract) ?? null}
      kickoff={(kickoff as Kickoff) ?? null}
      activities={(activities as Activity[]) ?? []}
      calls={(calls as CallLog[]) ?? []}
      script={settings?.cold_call_script ?? null}
      notes={(notes as Activity[]) ?? []}
    />
  );
}
