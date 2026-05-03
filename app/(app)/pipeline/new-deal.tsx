"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Deal } from "@/lib/db/types";
import { X } from "lucide-react";

export function NewDealDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (d: Deal) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    company: "",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    hook_note: "",
    deal_value: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setError("Nicht eingeloggt"); setLoading(false); return; }
    const payload = {
      user_id: u.user.id,
      company: form.company,
      contact_name: form.contact_name || null,
      email: form.email || null,
      phone: form.phone || null,
      website: form.website || null,
      hook_note: form.hook_note || null,
      deal_value: form.deal_value ? Number(form.deal_value) : null,
      stage: "cold" as const,
    };
    const { data, error } = await supabase.from("deals").insert(payload).select().single();
    if (error) { setError(error.message); setLoading(false); return; }
    onCreated(data as Deal);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="card w-full max-w-lg p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Neuer Deal</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="size-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Firma *</label>
            <input className="input" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ansprechpartner</label>
              <input className="input" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">E-Mail</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Hook / Problem</label>
            <input className="input" value={form.hook_note} onChange={(e) => setForm({ ...form, hook_note: e.target.value })} placeholder="z. B. mobile Ansicht kostet Bewerber" />
          </div>
          <div>
            <label className="label">Deal-Wert (€)</label>
            <input className="input" type="number" value={form.deal_value} onChange={(e) => setForm({ ...form, deal_value: e.target.value })} />
          </div>
          {error && <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">{error}</div>}
          <div className="flex gap-2 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Abbrechen</button>
            <button className="btn-primary flex-1" disabled={loading}>{loading ? "Erstelle…" : "Anlegen"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
