"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CallLog, Deal } from "@/lib/db/types";
import { CALL_OUTCOMES, fmtDateTime } from "@/lib/utils";
import { CallDialog } from "@/components/call-dialog";
import { Phone, PlusCircle } from "lucide-react";

const outcomeColors: Record<string, string> = {
  no_answer: "border-zinc-500/30 bg-zinc-500/5 text-zinc-300",
  voicemail: "border-zinc-500/30 bg-zinc-500/5 text-zinc-300",
  callback: "border-amber-500/30 bg-amber-500/5 text-amber-300",
  talked: "border-blue-500/30 bg-blue-500/5 text-blue-300",
  scheduled: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
  not_interested: "border-red-500/30 bg-red-500/5 text-red-300",
};

export function CallsSection({ deal, calls }: { deal: Deal; calls: CallLog[] }) {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const outcomeLabel = (o: string) => CALL_OUTCOMES.find((c) => c.id === o)?.label ?? o;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">Anrufe</h2>
          {calls.length > 0 && <span className="text-xs text-zinc-500">{calls.length} protokolliert</span>}
        </div>
        <button onClick={() => setShowDialog(true)} className="btn-primary">
          <PlusCircle className="size-4" /> Anruf protokollieren
        </button>
      </div>

      <div className="space-y-2">
        {calls.length === 0 ? (
          <div className="card p-6 text-center text-sm text-zinc-500">
            Noch keine Anrufe protokolliert.
          </div>
        ) : (
          calls.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{fmtDateTime(c.called_at)}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                      <span className={`rounded-full border px-2 py-0.5 ${outcomeColors[c.outcome] ?? ""}`}>
                        {outcomeLabel(c.outcome)}
                      </span>
                      {c.duration_seconds != null && (
                        <span>{Math.round(c.duration_seconds / 60)} Min.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {c.notes && <div className="mt-3 text-sm text-zinc-300">{c.notes}</div>}
            </div>
          ))
        )}
      </div>

      {showDialog && (
        <CallDialog
          dealId={deal.id}
          phone={deal.phone}
          company={deal.company}
          email={deal.email}
          contactName={deal.contact_name}
          currentStage={deal.stage}
          onClose={() => setShowDialog(false)}
          onLogged={() => router.refresh()}
        />
      )}
    </section>
  );
}
