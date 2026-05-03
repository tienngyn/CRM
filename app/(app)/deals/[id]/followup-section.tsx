"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Deal } from "@/lib/db/types";
import { fmtDateTime, cn } from "@/lib/utils";
import { Bell, BellOff, AlertCircle, Check } from "lucide-react";

export function FollowUpSection({ deal, onUpdate }: {
  deal: Deal;
  onUpdate: (d: Deal) => void;
}) {
  const [date, setDate] = useState(deal.next_action_at?.slice(0, 16) ?? "");
  const [note, setNote] = useState(deal.follow_up_note ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isOverdue = deal.next_action_at && new Date(deal.next_action_at) < new Date();

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("deals")
      .update({
        next_action_at: date ? new Date(date).toISOString() : null,
        follow_up_note: note || null,
      })
      .eq("id", deal.id)
      .select()
      .single();
    if (data) onUpdate(data as Deal);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function clear() {
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("deals")
      .update({ next_action_at: null, follow_up_note: null })
      .eq("id", deal.id)
      .select()
      .single();
    if (data) onUpdate(data as Deal);
    setDate("");
    setNote("");
    setSaving(false);
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Bell className="size-4 text-zinc-400" />
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">Follow-up</h2>
        {isOverdue && (
          <span className="flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
            <AlertCircle className="size-3" /> Überfällig
          </span>
        )}
      </div>

      <div className="card p-5 space-y-4">
        {deal.next_action_at && (
          <div className={cn(
            "flex items-center justify-between rounded-lg border p-3 text-sm",
            isOverdue
              ? "border-accent/30 bg-accent/5 text-accent"
              : "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
          )}>
            <div>
              <div className="font-medium">{fmtDateTime(deal.next_action_at)}</div>
              {deal.follow_up_note && <div className="mt-0.5 text-xs opacity-80">{deal.follow_up_note}</div>}
            </div>
            <button onClick={clear} className="btn-ghost p-1.5" title="Entfernen">
              <BellOff className="size-4" />
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Datum & Uhrzeit</label>
            <input
              type="datetime-local"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Was ist zu tun?</label>
            <input
              className="input"
              placeholder="z. B. Rückruf, Angebot nachfassen…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} className="btn-primary" disabled={saving || !date}>
            <Bell className="size-4" /> {saving ? "Speichere…" : "Follow-up setzen"}
          </button>
          {saved && <span className="flex items-center gap-1 text-xs text-emerald-400"><Check className="size-3" /> Gespeichert</span>}
        </div>
      </div>
    </section>
  );
}
