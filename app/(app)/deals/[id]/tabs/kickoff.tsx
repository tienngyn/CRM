"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Kickoff } from "@/lib/db/types";

const ITEMS = [
  { key: "hosting_creds_received", label: "Hosting-Zugang erhalten" },
  { key: "domain_access_received", label: "Domain-Zugang erhalten" },
  { key: "logo_received", label: "Logo erhalten" },
  { key: "assets_received", label: "Bilder & Materialien erhalten" },
  { key: "texts_received", label: "Texte erhalten" },
] as const;

export function KickoffTab({ dealId, initial }: { dealId: string; initial: Kickoff | null }) {
  const [form, setForm] = useState({
    hosting_creds_received: initial?.hosting_creds_received ?? false,
    domain_access_received: initial?.domain_access_received ?? false,
    assets_received: initial?.assets_received ?? false,
    texts_received: initial?.texts_received ?? false,
    logo_received: initial?.logo_received ?? false,
    next_feedback_at: initial?.next_feedback_at?.slice(0, 16) ?? "",
    notes: initial?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("kickoffs").upsert({
      deal_id: dealId,
      ...form,
      next_feedback_at: form.next_feedback_at ? new Date(form.next_feedback_at).toISOString() : null,
      notes: form.notes || null,
    });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const done = ITEMS.filter((i) => (form as any)[i.key]).length;
  const pct = Math.round((done / ITEMS.length) * 100);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-white/5 bg-bg-elevated p-4 text-sm text-zinc-400">
        <strong className="text-white">Ziel:</strong> Projekt-Fahrplan & Datensammlung. Sammle alle Zugänge und Materialien, lege nächsten Feedback-Termin fest.
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Fortschritt</span>
          <span className="text-zinc-400">{done}/{ITEMS.length} · {pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {ITEMS.map((i) => (
          <label key={i.key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm hover:bg-white/[0.04]">
            <input
              type="checkbox"
              checked={(form as any)[i.key]}
              onChange={(e) => setForm({ ...form, [i.key]: e.target.checked })}
              className="size-4 rounded border-white/20 bg-transparent accent-accent"
            />
            <span className={(form as any)[i.key] ? "text-white" : "text-zinc-400"}>{i.label}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="label">Nächster Feedback-Termin</label>
        <input className="input" type="datetime-local" value={form.next_feedback_at} onChange={(e) => setForm({ ...form, next_feedback_at: e.target.value })} />
      </div>
      <div>
        <label className="label">Notizen</label>
        <textarea className="input min-h-[80px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} className="btn-primary" disabled={saving}>{saving ? "Speichere…" : "Speichern"}</button>
        {saved && <span className="text-xs text-emerald-400">✓ Gespeichert</span>}
      </div>
    </div>
  );
}
