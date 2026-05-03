"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Deal } from "@/lib/db/types";
import { X, Save } from "lucide-react";

export function EditDealDialog({
  deal,
  onClose,
  onSaved,
}: {
  deal: Deal;
  onClose: () => void;
  onSaved: (d: Deal) => void;
}) {
  const [form, setForm] = useState({
    company: deal.company,
    contact_name: deal.contact_name ?? "",
    email: deal.email ?? "",
    phone: deal.phone ?? "",
    website: deal.website ?? "",
    hook_note: deal.hook_note ?? "",
    deal_value: deal.deal_value?.toString() ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim()) { setError("Firma ist Pflicht."); return; }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data, error: e2 } = await supabase
      .from("deals")
      .update({
        company: form.company.trim(),
        contact_name: form.contact_name || null,
        email: form.email || null,
        phone: form.phone || null,
        website: form.website || null,
        hook_note: form.hook_note || null,
        deal_value: form.deal_value ? Number(form.deal_value) : null,
      })
      .eq("id", deal.id)
      .select()
      .single();
    if (e2) { setError(e2.message); setSaving(false); return; }
    onSaved(data as Deal);
    onClose();
  }

  const field = (label: string, key: keyof typeof form, opts?: { type?: string; placeholder?: string }) => (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type={opts?.type ?? "text"}
        placeholder={opts?.placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-lg p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Deal bearbeiten</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="size-4" /></button>
        </div>
        <form onSubmit={save} className="space-y-4">
          {field("Firma *", "company")}
          <div className="grid grid-cols-2 gap-4">
            {field("Ansprechpartner", "contact_name")}
            {field("Telefon", "phone")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field("E-Mail", "email", { type: "email" })}
            {field("Website", "website", { placeholder: "www.beispiel.de" })}
          </div>
          {field("Hook / Problem", "hook_note", { placeholder: "z. B. Mobile Ansicht defekt" })}
          {field("Deal-Wert (€)", "deal_value", { type: "number" })}
          {error && (
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">{error}</div>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Abbrechen</button>
            <button className="btn-primary flex-1" disabled={saving}>
              <Save className="size-4" /> {saving ? "Speichere…" : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
