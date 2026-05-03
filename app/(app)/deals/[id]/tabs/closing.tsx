"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Contract } from "@/lib/db/types";
import { CheckCircle2, Circle, Lock } from "lucide-react";

export function ClosingTab({ dealId, initial }: { dealId: string; initial: Contract | null }) {
  const [form, setForm] = useState({
    signed_at: initial?.signed_at?.slice(0, 16) ?? "",
    signature_url: initial?.signature_url ?? "",
    total_amount: initial?.total_amount?.toString() ?? "",
    deposit_amount: initial?.deposit_amount?.toString() ?? "",
    deposit_invoice_sent_at: initial?.deposit_invoice_sent_at?.slice(0, 16) ?? "",
    deposit_paid_at: initial?.deposit_paid_at?.slice(0, 16) ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("contracts").upsert({
      deal_id: dealId,
      signed_at: form.signed_at ? new Date(form.signed_at).toISOString() : null,
      signature_url: form.signature_url || null,
      total_amount: form.total_amount ? Number(form.total_amount) : null,
      deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : null,
      deposit_invoice_sent_at: form.deposit_invoice_sent_at ? new Date(form.deposit_invoice_sent_at).toISOString() : null,
      deposit_paid_at: form.deposit_paid_at ? new Date(form.deposit_paid_at).toISOString() : null,
    });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const checks = [
    { label: "Unterschrift erhalten", done: !!form.signed_at },
    { label: "Anzahlungsrechnung gestellt", done: !!form.deposit_invoice_sent_at },
    { label: "Anzahlung eingegangen", done: !!form.deposit_paid_at },
  ];

  const canActivate = !!form.signed_at && !!form.deposit_paid_at;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 text-sm text-zinc-300">
        <div className="flex items-center gap-2 font-semibold text-accent">
          <Lock className="size-4" /> Goldene Regel
        </div>
        <p className="mt-2">Kein Design, kein Code ohne Geldeingang. Reihenfolge: <strong className="text-white">Unterschrift → Anzahlung (30–50 %) → Start</strong>.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {checks.map((c, i) => (
          <div key={i} className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${c.done ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : "border-white/10 bg-white/[0.02] text-zinc-400"}`}>
            {c.done ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
            {c.label}
          </div>
        ))}
      </div>

      <div className={`rounded-lg border p-3 text-sm ${canActivate ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" : "border-white/10 bg-white/[0.02] text-zinc-500"}`}>
        {canActivate ? "✓ Bereit für Active-Phase" : "Active-Phase gesperrt bis Unterschrift + Anzahlung"}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Unterschrieben am</label>
          <input className="input" type="datetime-local" value={form.signed_at} onChange={(e) => setForm({ ...form, signed_at: e.target.value })} />
        </div>
        <div>
          <label className="label">Vertrag/Signatur URL</label>
          <input className="input" value={form.signature_url} onChange={(e) => setForm({ ...form, signature_url: e.target.value })} placeholder="https://…" />
        </div>
        <div>
          <label className="label">Gesamtbetrag (€)</label>
          <input className="input" type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} />
        </div>
        <div>
          <label className="label">Anzahlung (€)</label>
          <input className="input" type="number" value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })} />
        </div>
        <div>
          <label className="label">Anzahlungsrechnung versendet</label>
          <input className="input" type="datetime-local" value={form.deposit_invoice_sent_at} onChange={(e) => setForm({ ...form, deposit_invoice_sent_at: e.target.value })} />
        </div>
        <div>
          <label className="label">Anzahlung erhalten am</label>
          <input className="input" type="datetime-local" value={form.deposit_paid_at} onChange={(e) => setForm({ ...form, deposit_paid_at: e.target.value })} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} className="btn-primary" disabled={saving}>{saving ? "Speichere…" : "Speichern"}</button>
        {saved && <span className="text-xs text-emerald-400">✓ Gespeichert</span>}
      </div>
    </div>
  );
}
