"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Proposal } from "@/lib/db/types";

export function ProposalTab({ dealId, initial }: { dealId: string; initial: Proposal | null }) {
  const [form, setForm] = useState({
    pdf_url: initial?.pdf_url ?? "",
    loom_url: initial?.loom_url ?? "",
    price: initial?.price?.toString() ?? "",
    sent_at: initial?.sent_at?.slice(0, 16) ?? "",
    presented_at: initial?.presented_at?.slice(0, 16) ?? "",
    status: initial?.status ?? "draft",
    notes: initial?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("proposals").upsert({
      deal_id: dealId,
      pdf_url: form.pdf_url || null,
      loom_url: form.loom_url || null,
      price: form.price ? Number(form.price) : null,
      sent_at: form.sent_at ? new Date(form.sent_at).toISOString() : null,
      presented_at: form.presented_at ? new Date(form.presented_at).toISOString() : null,
      status: form.status,
      notes: form.notes || null,
    });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-white/5 bg-bg-elevated p-4 text-sm text-zinc-400">
        Stelle die <strong className="text-white">Ziele des Kunden</strong> in den Mittelpunkt (z. B. „System zur Azubi-Gewinnung"). Präsentiere per Screen-Share oder Loom — niemals nur PDF schicken.
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Proposal PDF URL</label>
          <input className="input" value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} placeholder="https://…" />
        </div>
        <div>
          <label className="label">Loom URL</label>
          <input className="input" value={form.loom_url} onChange={(e) => setForm({ ...form, loom_url: e.target.value })} placeholder="https://loom.com/…" />
        </div>
        <div>
          <label className="label">Preis (€)</label>
          <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="sent">Versendet</option>
            <option value="presented">Präsentiert</option>
            <option value="accepted">Angenommen</option>
            <option value="rejected">Abgelehnt</option>
          </select>
        </div>
        <div>
          <label className="label">Versendet am</label>
          <input className="input" type="datetime-local" value={form.sent_at} onChange={(e) => setForm({ ...form, sent_at: e.target.value })} />
        </div>
        <div>
          <label className="label">Präsentiert am</label>
          <input className="input" type="datetime-local" value={form.presented_at} onChange={(e) => setForm({ ...form, presented_at: e.target.value })} />
        </div>
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
