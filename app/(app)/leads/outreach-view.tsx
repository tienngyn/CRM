"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Deal } from "@/lib/db/types";
import { fmtEur, fmtDateTime, CALL_OUTCOMES, DAILY_CALL_GOAL } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { CallDialog } from "@/components/call-dialog";
import { CsvImportModal } from "./csv-import";
import { NewDealDialog } from "../pipeline/new-deal";
import {
  Target, FileText, Check, X, Plus, Upload,
  ExternalLink, ChevronDown, ArrowUpDown, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Filter = "all" | "untouched" | "callback" | "scheduled";
type Sort = "last_call" | "name" | "value";

const outcomeLabel = (o: string) => CALL_OUTCOMES.find((c) => c.id === o)?.label ?? o;

export function OutreachView({
  initialDeals, lastCallByDeal, todayCalls, dailyGoal, script, userId,
}: {
  initialDeals: Deal[];
  lastCallByDeal: Record<string, { called_at: string; outcome: string }>;
  todayCalls: number;
  dailyGoal: number;
  script: string;
  userId: string;
}) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [callDeal, setCallDeal] = useState<Deal | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("last_call");
  const [callsDone, setCallsDone] = useState(todayCalls);

  // Script editor
  const [showScript, setShowScript] = useState(false);
  const [scriptText, setScriptText] = useState(script);
  const [editScript, setEditScript] = useState(script);
  const [savingScript, setSavingScript] = useState(false);
  const [scriptGoal, setScriptGoal] = useState(dailyGoal);
  const [editGoal, setEditGoal] = useState(String(dailyGoal));

  const router = useRouter();

  async function saveSettings() {
    setSavingScript(true);
    const supabase = createClient();
    await supabase.from("user_settings").upsert({
      user_id: userId,
      cold_call_script: editScript,
      daily_call_goal: Number(editGoal) || 30,
      updated_at: new Date().toISOString(),
    });
    setScriptText(editScript);
    setScriptGoal(Number(editGoal) || 30);
    setSavingScript(false);
    setShowScript(false);
  }

  const callPct = Math.min(100, Math.round((callsDone / scriptGoal) * 100));

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...deals];
    if (filter === "untouched") list = list.filter((d) => !lastCallByDeal[d.id]);
    if (filter === "callback") list = list.filter((d) => lastCallByDeal[d.id]?.outcome === "callback");
    if (filter === "scheduled") list = list.filter((d) => lastCallByDeal[d.id]?.outcome === "scheduled");

    list.sort((a, b) => {
      if (sort === "name") return a.company.localeCompare(b.company);
      if (sort === "value") return (b.deal_value ?? 0) - (a.deal_value ?? 0);
      // last_call: untouched first, then by date desc
      const la = lastCallByDeal[a.id]?.called_at;
      const lb = lastCallByDeal[b.id]?.called_at;
      if (!la && !lb) return 0;
      if (!la) return -1;
      if (!lb) return 1;
      return new Date(lb).getTime() - new Date(la).getTime();
    });
    return list;
  }, [deals, filter, sort, lastCallByDeal]);

  const FILTERS: { id: Filter; label: string }[] = [
    { id: "all", label: `Alle (${deals.length})` },
    { id: "untouched", label: `Noch nicht angerufen (${deals.filter((d) => !lastCallByDeal[d.id]).length})` },
    { id: "callback", label: `Rückruf fällig (${deals.filter((d) => lastCallByDeal[d.id]?.outcome === "callback").length})` },
    { id: "scheduled", label: `Termin gemacht (${deals.filter((d) => lastCallByDeal[d.id]?.outcome === "scheduled").length})` },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Outreach</h1>
          <p className="mt-1 text-sm text-zinc-400">{deals.length} Cold-Call-Kandidaten</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCsv(true)} className="btn-secondary">
            <Upload className="size-4" /> CSV importieren
          </button>
          <button onClick={() => setShowNew(true)} className="btn-primary">
            <Plus className="size-4" /> Neuer Lead
          </button>
        </div>
      </div>

      {/* Daily goal */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <Target className="size-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{callsDone}</span>
                <span className="text-zinc-500">/ {scriptGoal} Calls heute</span>
                {callPct >= 100 && <span className="text-xs text-emerald-400">🔥 Ziel erreicht!</span>}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${callPct}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => { setEditScript(scriptText); setEditGoal(String(scriptGoal)); setShowScript(!showScript); }}
            className="btn-secondary shrink-0"
          >
            <FileText className="size-4" /> Skript
            <ChevronDown className={cn("size-4 transition-transform", showScript && "rotate-180")} />
          </button>
        </div>

        {/* Script editor */}
        {showScript && (
          <div className="mt-5 border-t border-white/5 pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <div>
                <label className="label">Cold-Call-Skript</label>
                <textarea
                  className="input min-h-[180px] font-mono text-xs leading-relaxed"
                  value={editScript}
                  onChange={(e) => setEditScript(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Tagesziel</label>
                <input
                  className="input"
                  type="number"
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveSettings} className="btn-primary" disabled={savingScript}>
                <Check className="size-4" /> {savingScript ? "Speichere…" : "Speichern"}
              </button>
              <button onClick={() => setShowScript(false)} className="btn-secondary">
                <X className="size-4" /> Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                filter === f.id
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="size-3.5 text-zinc-500" />
          {([["last_call", "Letzter Anruf"], ["name", "Name"], ["value", "Wert"]] as [Sort, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSort(id)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium transition",
                sort === id
                  ? "border-white/20 bg-white/[0.06] text-white"
                  : "border-white/5 text-zinc-500 hover:text-zinc-300"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lead table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 text-left font-medium">Firma</th>
              <th className="px-4 py-3 text-left font-medium">Ansprechpartner</th>
              <th className="px-4 py-3 text-left font-medium">Telefon</th>
              <th className="px-4 py-3 text-left font-medium">Letzter Anruf</th>
              <th className="px-4 py-3 text-right font-medium">Wert</th>
              <th className="px-4 py-3 text-right font-medium">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-500">
                  Keine Leads in dieser Kategorie.
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const last = lastCallByDeal[d.id];
                const isCallback = last?.outcome === "callback";
                return (
                  <tr
                    key={d.id}
                    className={cn(
                      "border-b border-white/5 transition hover:bg-white/[0.02]",
                      isCallback && "bg-amber-500/[0.03]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <Link href={`/deals/${d.id}`} className="font-medium text-white hover:text-accent">
                        {d.company}
                      </Link>
                      {d.hook_note && (
                        <div className="mt-0.5 max-w-[200px] truncate text-xs text-zinc-500" title={d.hook_note}>
                          {d.hook_note}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{d.contact_name ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{d.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      {last ? (
                        <div>
                          <div className="text-zinc-400">{fmtDateTime(last.called_at)}</div>
                          <div className={cn(
                            "mt-0.5 text-[10px] uppercase tracking-wider",
                            last.outcome === "callback" && "text-amber-400",
                            last.outcome === "scheduled" && "text-emerald-400",
                            last.outcome === "no_answer" && "text-zinc-500",
                          )}>
                            {outcomeLabel(last.outcome)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-600">Noch nicht</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-accent">{fmtEur(d.deal_value)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setCallDeal(d)}
                          className="btn-primary py-1.5 text-xs"
                        >
                          <Phone className="size-3.5" /> Anrufen
                        </button>
                        <Link href={`/deals/${d.id}`} className="btn-ghost p-1.5">
                          <ExternalLink className="size-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {callDeal && (
        <CallDialog
          dealId={callDeal.id}
          phone={callDeal.phone}
          company={callDeal.company}
          email={callDeal.email}
          contactName={callDeal.contact_name}
          currentStage={callDeal.stage}
          script={scriptText}
          onClose={() => setCallDeal(null)}
          onLogged={() => { setCallsDone((n) => n + 1); router.refresh(); }}
        />
      )}
      {showNew && (
        <NewDealDialog
          onClose={() => setShowNew(false)}
          onCreated={(d) => setDeals((ds) => [d, ...ds])}
        />
      )}
      {showCsv && (
        <CsvImportModal
          onClose={() => setShowCsv(false)}
          onImported={(newDeals) => { setDeals((ds) => [...newDeals, ...ds]); setShowCsv(false); }}
        />
      )}
    </div>
  );
}
