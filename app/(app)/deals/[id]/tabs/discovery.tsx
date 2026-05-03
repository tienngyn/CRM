"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DiscoveryNote } from "@/lib/db/types";

export function DiscoveryTab({ dealId, initial }: { dealId: string; initial: DiscoveryNote | null }) {
  const [form, setForm] = useState({
    goal: initial?.goal ?? "",
    customer_lifetime_value: initial?.customer_lifetime_value ?? "",
    main_pain: initial?.main_pain ?? "",
    decision_maker: initial?.decision_maker ?? "",
    budget_indication: initial?.budget_indication ?? "",
    notes: initial?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("discovery_notes").upsert({ deal_id: dealId, ...form, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fields = [
    { key: "goal", label: "Was ist das Ziel der Seite?", placeholder: "z. B. Mehr Bewerbungen für offene Stellen" },
    { key: "customer_lifetime_value", label: "Was ist ein neuer Kunde wert?", placeholder: "€-Wert / LTV" },
    { key: "main_pain", label: "Was stört Sie aktuell am meisten?", placeholder: "Hauptpain" },
    { key: "decision_maker", label: "Wer entscheidet?", placeholder: "Entscheidungsgewalt" },
    { key: "budget_indication", label: "Budget-Indikation", placeholder: "Range / Erwartung" },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-white/5 bg-bg-elevated p-4 text-sm text-zinc-400">
        <strong className="text-white">Du bist der Arzt.</strong> Stelle Fragen, statt zu präsentieren. Ziel: Budget, Bedarf, Entscheidungsgewalt klären.
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            <textarea
              className="input min-h-[80px]"
              placeholder={f.placeholder}
              value={(form as any)[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="label">Weitere Notizen</label>
        <textarea className="input min-h-[100px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} className="btn-primary" disabled={saving}>
          {saving ? "Speichere…" : "Speichern"}
        </button>
        {saved && <span className="text-xs text-emerald-400">✓ Gespeichert</span>}
      </div>
    </div>
  );
}
