"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Deal } from "@/lib/db/types";
import { X, Upload, AlertCircle, Check } from "lucide-react";

type Row = { company: string; contact_name: string; phone: string; email: string; website: string; hook_note: string; deal_value: string };

function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z_]/g, ""));
  const map: Record<string, string> = {
    firma: "company", company: "company", unternehmen: "company",
    ansprechpartner: "contact_name", contact: "contact_name", name: "contact_name",
    telefon: "phone", phone: "phone", tel: "phone",
    email: "email", mail: "email",
    website: "website", url: "website", webseite: "website",
    hook: "hook_note", problem: "hook_note", notiz: "hook_note",
    wert: "deal_value", value: "deal_value", preis: "deal_value",
  };
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: any = { company: "", contact_name: "", phone: "", email: "", website: "", hook_note: "", deal_value: "" };
    headers.forEach((h, i) => {
      const key = map[h];
      if (key) row[key] = values[i] ?? "";
    });
    return row as Row;
  }).filter((r) => r.company);
}

export function CsvImportModal({ onClose, onImported }: {
  onClose: () => void;
  onImported: (deals: Deal[]) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text);
      if (!parsed.length) { setError("Keine Zeilen gefunden. Prüfe das Format."); return; }
      setError(null);
      setRows(parsed);
    };
    reader.readAsText(file, "utf-8");
  }

  async function importRows() {
    setImporting(true);
    setError(null);
    const supabase = createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setError("Nicht eingeloggt"); setImporting(false); return; }

    const payload = rows.map((r) => ({
      user_id: u.user!.id,
      company: r.company,
      contact_name: r.contact_name || null,
      phone: r.phone || null,
      email: r.email || null,
      website: r.website || null,
      hook_note: r.hook_note || null,
      deal_value: r.deal_value ? Number(r.deal_value.replace(/[^0-9.]/g, "")) || null : null,
      stage: "cold" as const,
    }));

    const { data, error: e } = await supabase.from("deals").insert(payload).select();
    if (e) { setError(e.message); setImporting(false); return; }
    setDone(true);
    setTimeout(() => onImported(data as Deal[]), 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-2xl p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">CSV importieren</h2>
            <p className="mt-0.5 text-xs text-zinc-500">Spalten: Firma, Ansprechpartner, Telefon, Email, Website, Hook, Wert</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="size-4" /></button>
        </div>

        {done ? (
          <div className="py-8 text-center">
            <Check className="mx-auto size-10 text-emerald-400" />
            <p className="mt-3 text-sm text-emerald-300">{rows.length} Leads importiert!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-8 transition hover:border-accent/40 hover:bg-accent/[0.03]"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-8 text-zinc-500" />
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-300">CSV-Datei auswählen</p>
                <p className="mt-1 text-xs text-zinc-500">UTF-8, kommagetrennt, erste Zeile = Spaltenbezeichnungen</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
                <AlertCircle className="size-4 shrink-0" /> {error}
              </div>
            )}

            {rows.length > 0 && (
              <>
                <div className="max-h-52 overflow-auto rounded-lg border border-white/5">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-500">
                        {["Firma", "Ansprechpartner", "Telefon", "E-Mail", "Wert"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="px-3 py-2 font-medium text-white">{r.company}</td>
                          <td className="px-3 py-2 text-zinc-400">{r.contact_name || "—"}</td>
                          <td className="px-3 py-2 text-zinc-400">{r.phone || "—"}</td>
                          <td className="px-3 py-2 text-zinc-400">{r.email || "—"}</td>
                          <td className="px-3 py-2 text-zinc-400">{r.deal_value || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{rows.length} Leads erkannt</span>
                  <div className="flex gap-2">
                    <button onClick={onClose} className="btn-secondary">Abbrechen</button>
                    <button onClick={importRows} className="btn-primary" disabled={importing}>
                      {importing ? "Importiere…" : `${rows.length} Leads importieren`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
