"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Activity } from "@/lib/db/types";
import { fmtDateTime } from "@/lib/utils";
import { StickyNote, Send, Trash2 } from "lucide-react";

export function NotesSection({ dealId, initialNotes }: {
  dealId: string;
  initialNotes: Activity[];
}) {
  const [notes, setNotes] = useState<Activity[]>(initialNotes);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function addNote() {
    if (!text.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSaving(false); return; }
    const { data } = await supabase
      .from("activities")
      .insert({ deal_id: dealId, user_id: u.user.id, type: "note", body: text.trim() })
      .select()
      .single();
    if (data) setNotes((ns) => [data as Activity, ...ns]);
    setText("");
    setSaving(false);
  }

  async function deleteNote(id: string) {
    const supabase = createClient();
    await supabase.from("activities").delete().eq("id", id);
    setNotes((ns) => ns.filter((n) => n.id !== id));
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <StickyNote className="size-4 text-zinc-400" />
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">Notizen</h2>
      </div>

      {/* Quick add */}
      <div className="card mb-3 flex gap-3 p-3">
        <textarea
          className="input min-h-[72px] flex-1 resize-none"
          placeholder="Notiz hinzufügen…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote(); }}
        />
        <button
          onClick={addNote}
          disabled={saving || !text.trim()}
          className="btn-primary self-end"
        >
          <Send className="size-4" />
        </button>
      </div>

      {/* Notes list */}
      <div className="space-y-2">
        {notes.length === 0 ? (
          <div className="rounded-lg border border-white/5 p-6 text-center text-sm text-zinc-500">
            Noch keine Notizen.
          </div>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="group card p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1 text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">{n.body}</p>
                <button
                  onClick={() => deleteNote(n.id)}
                  className="btn-ghost shrink-0 p-1 opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5 text-zinc-500" />
                </button>
              </div>
              <div className="mt-2 text-xs text-zinc-600">{fmtDateTime(n.created_at)}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
