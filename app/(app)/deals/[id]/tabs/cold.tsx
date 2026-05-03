"use client";

import type { Deal } from "@/lib/db/types";
import { fmtDateTime } from "@/lib/utils";
import { Calendar } from "lucide-react";

const DEFAULT_SCRIPT = `Guten Tag, mein Name ist [Dein Name], ich bin Webdesigner und helfe Handwerksbetrieben dabei, mehr Kunden und Bewerber über ihre Website zu gewinnen.

Ich habe mir Ihre Website kurz angeschaut und ein Detail entdeckt, das Sie täglich potenzielle [Kunden/Mitarbeiter] kosten könnte.

Darf ich das in 2 Sätzen erklären?

[Pause — Reaktion abwarten]

Hätten Sie diese Woche 15 Minuten für einen kurzen Video-Call? Ich zeige Ihnen konkret, was ich meine — ohne Verkaufsgespräch.`;

export function ColdTab({
  deal,
  onUpdate,
  script,
}: {
  deal: Deal;
  onUpdate?: (d: Deal) => void;
  script?: string | null;
}) {
  const displayScript = script || DEFAULT_SCRIPT;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Cold Call — Skript</h3>
        <div className="rounded-lg border border-white/5 bg-bg-elevated p-5 text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
          {displayScript}
        </div>
        <p className="mt-2 text-xs text-zinc-600">
          Skript bearbeiten: Outreach → Skript-Button oben
        </p>
      </div>

      {deal.discovery_at && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">
          <div className="flex items-center gap-2 font-medium">
            <Calendar className="size-4" /> Discovery-Termin geplant
          </div>
          <div className="mt-1 text-zinc-300">{fmtDateTime(deal.discovery_at)}</div>
        </div>
      )}
    </div>
  );
}
