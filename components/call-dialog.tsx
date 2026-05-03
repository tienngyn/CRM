"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CALL_OUTCOMES, cn } from "@/lib/utils";
import type { CallOutcome } from "@/lib/db/types";
import { X, Phone, Mail, Calendar, FileText, ChevronDown } from "lucide-react";

export function CallDialog({
  dealId,
  phone,
  company,
  email,
  contactName,
  currentStage,
  script,
  onClose,
  onLogged,
}: {
  dealId: string;
  phone: string | null;
  company: string;
  email?: string | null;
  contactName?: string | null;
  currentStage: string;
  script?: string | null;
  onClose: () => void;
  onLogged?: () => void;
}) {
  const [outcome, setOutcome] = useState<CallOutcome>("no_answer");
  const [notes, setNotes] = useState("");
  const [discoveryAt, setDiscoveryAt] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [showScript, setShowScript] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isScheduled = outcome === "scheduled";
  const needsFollowUp = outcome === "no_answer" || outcome === "callback";

  function buildMailto() {
    if (!email || !discoveryAt) return null;
    const dt = new Date(discoveryAt);
    const dateStr = dt.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const timeStr = dt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const subject = encodeURIComponent(`Discovery Call — Termin am ${dt.toLocaleDateString("de-DE")}`);
    const body = encodeURIComponent(
      `Hallo${contactName ? ` ${contactName}` : ""},\n\n` +
      `wie besprochen, hier die Bestätigung unseres Termins:\n\n` +
      `📅 ${dateStr}\n🕐 ${timeStr}\n\n` +
      `Im Call schauen wir uns gemeinsam an, wie ${company} mehr aus der Webseite herausholen kann — konkret und ohne Verkaufsgespräch.\n\n` +
      `Beste Grüße`
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  async function save() {
    if (isScheduled && !discoveryAt) {
      setError("Bitte Termin eintragen.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setError("Nicht eingeloggt"); setSaving(false); return; }

    const { error: logErr } = await supabase.from("call_logs").insert({
      deal_id: dealId,
      user_id: u.user.id,
      outcome,
      notes: notes || null,
    });
    if (logErr) { setError(logErr.message); setSaving(false); return; }

    // If scheduled: save discovery_at + move to discovery stage
    if (isScheduled && discoveryAt) {
      await supabase.from("deals").update({
        discovery_at: new Date(discoveryAt).toISOString(),
        next_action_at: new Date(discoveryAt).toISOString(),
        ...(currentStage === "cold" ? { stage: "discovery" } : {}),
      }).eq("id", dealId);
    }

    // If not reached or callback: save follow-up date
    if (needsFollowUp && followUpAt) {
      const noteText = outcome === "callback" ? "Rückruf" : "Erneut anrufen";
      await supabase.from("deals").update({
        next_action_at: new Date(followUpAt).toISOString(),
        follow_up_note: noteText,
      }).eq("id", dealId);
    }

    setSaving(false);
    onLogged?.();
    onClose();
  }

  const mailto = buildMailto();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-md p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{company}</h2>
            <p className="text-xs text-zinc-500">{phone ?? "Keine Nummer hinterlegt"}</p>
          </div>
          <div className="flex items-center gap-1">
            {script && (
              <button
                onClick={() => setShowScript((v) => !v)}
                className={cn("btn-ghost p-1.5 text-xs gap-1", showScript && "text-white")}
                title="Skript anzeigen"
              >
                <FileText className="size-4" />
                <ChevronDown className={cn("size-3 transition-transform", showScript && "rotate-180")} />
              </button>
            )}
            <button onClick={onClose} className="btn-ghost p-1.5"><X className="size-4" /></button>
          </div>
        </div>

        {/* Script (collapsible) */}
        {showScript && script && (
          <div className="mb-4 rounded-lg border border-white/5 bg-bg-elevated p-4 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
            {script}
          </div>
        )}

        <div className="space-y-4">
          {/* Outcome */}
          <div>
            <label className="label">Ergebnis</label>
            <div className="grid grid-cols-2 gap-2">
              {CALL_OUTCOMES.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOutcome(o.id as CallOutcome)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    outcome === o.id
                      ? "border-accent/50 bg-accent/15 text-accent"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Discovery scheduling — only when "scheduled" */}
          {isScheduled && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                <Calendar className="size-4" /> Discovery-Call Termin
              </div>
              <div>
                <label className="label">Datum & Uhrzeit</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={discoveryAt}
                  onChange={(e) => setDiscoveryAt(e.target.value)}
                />
              </div>
              {mailto && (
                <a href={mailto} className="btn-secondary w-full">
                  <Mail className="size-4" /> Einladung per Mail senden
                </a>
              )}
              {!email && (
                <p className="text-xs text-zinc-500">Keine E-Mail hinterlegt — Einladung manuell schicken.</p>
              )}
              {currentStage === "cold" && (
                <p className="text-xs text-emerald-400/70">Deal wird automatisch in Discovery verschoben.</p>
              )}
            </div>
          )}

          {/* Follow-up — only for no_answer / callback */}
          {needsFollowUp && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-300">
                <Calendar className="size-4" />
                {outcome === "callback" ? "Wann zurückrufen?" : "Erneut anrufen"}
              </div>
              <input
                type="datetime-local"
                className="input"
                value={followUpAt}
                onChange={(e) => setFollowUpAt(e.target.value)}
              />
              <p className="text-xs text-zinc-500">Follow-up wird automatisch gesetzt.</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="label">Notizen</label>
            <textarea
              className="input min-h-[80px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z. B. Sekretärin, Rückruf 14 Uhr…"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">{error}</div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Abbrechen</button>
            <button onClick={save} className="btn-primary flex-1" disabled={saving}>
              {saving ? "Speichere…" : "Protokollieren"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
