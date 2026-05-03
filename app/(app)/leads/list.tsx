"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Deal } from "@/lib/db/types";
import { fmtEur, fmtDateTime, CALL_OUTCOMES } from "@/lib/utils";
import { Phone, ExternalLink, Plus } from "lucide-react";
import { CallDialog } from "@/components/call-dialog";
import { NewDealDialog } from "../pipeline/new-deal";

export function LeadsList({
  initialDeals,
  lastCallByDeal,
}: {
  initialDeals: Deal[];
  lastCallByDeal: Record<string, { called_at: string; outcome: string }>;
}) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [callDeal, setCallDeal] = useState<Deal | null>(null);
  const [showNew, setShowNew] = useState(false);
  const router = useRouter();

  const outcomeLabel = (o: string) => CALL_OUTCOMES.find((c) => c.id === o)?.label ?? o;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {deals.length} Cold-Call-Kandidaten
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus className="size-4" /> Neuer Lead
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 text-left font-medium">Firma</th>
              <th className="px-4 py-3 text-left font-medium">Ansprechpartner</th>
              <th className="px-4 py-3 text-left font-medium">Telefon</th>
              <th className="px-4 py-3 text-left font-medium">Hook</th>
              <th className="px-4 py-3 text-left font-medium">Letzter Anruf</th>
              <th className="px-4 py-3 text-right font-medium">Wert</th>
              <th className="px-4 py-3 text-right font-medium">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-500">
                  Keine Leads. Lege oben einen neuen an.
                </td>
              </tr>
            ) : (
              deals.map((d) => {
                const last = lastCallByDeal[d.id];
                return (
                  <tr key={d.id} className="border-b border-white/5 transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link href={`/deals/${d.id}`} className="font-medium text-white hover:text-accent">
                        {d.company}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{d.contact_name ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{d.phone ?? "—"}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-zinc-400">{d.hook_note ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {last ? (
                        <div>
                          <div>{fmtDateTime(last.called_at)}</div>
                          <div className="text-[10px] uppercase tracking-wider">{outcomeLabel(last.outcome)}</div>
                        </div>
                      ) : (
                        <span className="text-zinc-600">noch nicht</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-accent">{fmtEur(d.deal_value)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setCallDeal(d)}
                          className="btn-primary py-1.5 text-xs"
                        >
                          <Phone className="size-3.5" /> Anrufen
                        </button>
                        <Link
                          href={`/deals/${d.id}`}
                          className="btn-ghost p-1.5"
                          title="Öffnen"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {callDeal && (
        <CallDialog
          dealId={callDeal.id}
          phone={callDeal.phone}
          company={callDeal.company}
          email={callDeal.email}
          contactName={callDeal.contact_name}
          currentStage={callDeal.stage}
          onClose={() => setCallDeal(null)}
          onLogged={() => router.refresh()}
        />
      )}
      {showNew && (
        <NewDealDialog
          onClose={() => setShowNew(false)}
          onCreated={(d) => setDeals((ds) => [d, ...ds])}
        />
      )}
    </div>
  );
}
