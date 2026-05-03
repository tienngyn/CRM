"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Deal, DiscoveryNote, Proposal, Contract, Kickoff, Activity, CallLog } from "@/lib/db/types";
import { STAGES, type Stage, fmtEur, cn } from "@/lib/utils";
import { ArrowLeft, Phone, Mail, Globe, Trash2, PhoneCall, Pencil } from "lucide-react";
import { ColdTab } from "./tabs/cold";
import { DiscoveryTab } from "./tabs/discovery";
import { ProposalTab } from "./tabs/proposal";
import { ClosingTab } from "./tabs/closing";
import { KickoffTab } from "./tabs/kickoff";
import { CallsSection } from "./calls-section";
import { NotesSection } from "./notes-section";
import { FollowUpSection } from "./followup-section";
import { EditDealDialog } from "@/components/edit-deal-dialog";
import { useRouter } from "next/navigation";

export function DealView({
  deal: initialDeal, discovery, proposal, contract, kickoff,
  activities, calls, script, notes,
}: {
  deal: Deal;
  discovery: DiscoveryNote | null;
  proposal: Proposal | null;
  contract: Contract | null;
  kickoff: Kickoff | null;
  activities: Activity[];
  calls: CallLog[];
  script: string | null;
  notes: Activity[];
}) {
  const [deal, setDeal] = useState(initialDeal);
  const [stageError, setStageError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const router = useRouter();

  async function changeStage(newStage: Stage) {
    setStageError(null);
    const supabase = createClient();
    const { error, data } = await supabase.from("deals").update({ stage: newStage }).eq("id", deal.id).select().single();
    if (error) { setStageError(error.message); setTimeout(() => setStageError(null), 5000); return; }
    setDeal(data as Deal);
  }

  async function deleteDeal() {
    if (!confirm(`Deal "${deal.company}" wirklich löschen?`)) return;
    const supabase = createClient();
    await supabase.from("deals").delete().eq("id", deal.id);
    router.push("/pipeline");
  }

  const telHref = deal.phone ? `tel:${deal.phone.replace(/\s/g, "")}` : null;

  const phaseContent = (() => {
    switch (deal.stage) {
      case "cold":      return <ColdTab deal={deal} onUpdate={setDeal} script={script} />;
      case "discovery": return <DiscoveryTab dealId={deal.id} initial={discovery} />;
      case "proposal":  return <ProposalTab dealId={deal.id} initial={proposal} />;
      case "closing":   return <ClosingTab dealId={deal.id} initial={contract} />;
      case "kickoff":
      case "active":    return <KickoffTab dealId={deal.id} initial={kickoff} />;
      default:          return <div className="text-sm text-zinc-500">Keine Inhalte für diese Phase.</div>;
    }
  })();

  const isOverdue = deal.next_action_at && new Date(deal.next_action_at) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/pipeline" className="btn-ghost -ml-2 mb-3"><ArrowLeft className="size-4" /> Pipeline</Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight truncate">{deal.company}</h1>
              {isOverdue && (
                <span className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                  Follow-up überfällig
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              {deal.contact_name && <span>{deal.contact_name}</span>}
              {deal.phone && <span className="inline-flex items-center gap-1"><Phone className="size-3" />{deal.phone}</span>}
              {deal.email && <span className="inline-flex items-center gap-1"><Mail className="size-3" />{deal.email}</span>}
              {deal.website && (
                <a href={deal.website.startsWith("http") ? deal.website : `https://${deal.website}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-accent">
                  <Globe className="size-3" />{deal.website}
                </a>
              )}
              {deal.hook_note && (
                <span className="badge max-w-[260px] truncate" title={deal.hook_note}>Hook: {deal.hook_note}</span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {telHref ? (
              <a href={telHref} className="btn-primary"><PhoneCall className="size-4" /> Anrufen</a>
            ) : (
              <button disabled className="btn-primary opacity-50"><PhoneCall className="size-4" /> Anrufen</button>
            )}
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Deal-Wert</div>
              <div className="text-xl font-semibold text-accent">{fmtEur(deal.deal_value)}</div>
            </div>
            <button onClick={() => setShowEdit(true)} className="btn-ghost p-2" title="Bearbeiten">
              <Pencil className="size-4" />
            </button>
            <button onClick={deleteDeal} className="btn-ghost p-2" title="Löschen">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Phase selector */}
      <div className="card p-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">Aktuelle Phase</div>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button key={s.id} onClick={() => changeStage(s.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                deal.stage === s.id
                  ? "border-accent/50 bg-accent/15 text-accent shadow-glow-red"
                  : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        {stageError && (
          <div className="mt-3 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">{stageError}</div>
        )}
      </div>

      {/* Phase content */}
      <div className="card p-6">{phaseContent}</div>

      {/* Follow-up — only for non-cold stages */}
      {deal.stage !== "cold" && <FollowUpSection deal={deal} onUpdate={setDeal} />}

      {/* Notes */}
      <NotesSection dealId={deal.id} initialNotes={notes} />

      {/* Calls */}
      <CallsSection deal={deal} calls={calls} />

      {/* Edit dialog */}
      {showEdit && (
        <EditDealDialog deal={deal} onClose={() => setShowEdit(false)} onSaved={setDeal} />
      )}
    </div>
  );
}
