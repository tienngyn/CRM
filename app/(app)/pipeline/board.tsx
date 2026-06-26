"use client";

import { useState } from "react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { createClient } from "@/lib/supabase/client";
import { STAGES, type Stage, fmtEur, cn } from "@/lib/utils";
import type { Deal } from "@/lib/db/types";
import { Plus } from "lucide-react";
import { NewDealDialog } from "./new-deal";

export function PipelineBoard({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId as Stage;
    const prev = deals;
    setDeals((ds) => ds.map((d) => (d.id === draggableId ? { ...d, stage: newStage } : d)));

    const supabase = createClient();
    const { error } = await supabase.from("deals").update({ stage: newStage }).eq("id", draggableId);
    if (error) {
      setError(error.message);
      setDeals(prev);
      setTimeout(() => setError(null), 4000);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="mt-1 text-sm text-zinc-400">{deals.length} aktive Deals</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus className="size-4" /> Neuer Deal
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
          {error}
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const stageValue = stageDeals.reduce((s, d) => s + (d.deal_value ?? 0), 0);
            return (
              <Droppable droppableId={stage.id} key={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex min-h-[400px] flex-col rounded-xl border border-white/10 bg-white/[0.02] p-3 transition",
                      snapshot.isDraggingOver && "border-accent/40 bg-accent/[0.04]"
                    )}
                    style={{ borderTop: `2px solid ${stage.color}` }}
                  >
                    <div className="mb-3 px-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-300">
                          <span className="size-2 rounded-full" style={{ background: stage.color }} />
                          {stage.label}
                        </span>
                        <span className="badge">{stageDeals.length}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500">
                        {stage.description} · {fmtEur(stageValue)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {stageDeals.map((d, i) => (
                        <Draggable key={d.id} draggableId={d.id} index={i}>
                          {(p, snap) => (
                            <Link
                              href={`/deals/${d.id}`}
                              ref={p.innerRef as any}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              className={cn(
                                "block rounded-lg border bg-bg-card p-3 text-sm transition hover:border-white/20",
                                snap.isDragging && "border-accent/50 shadow-glow-red",
                                !snap.isDragging && d.next_action_at && new Date(d.next_action_at) < new Date()
                                  ? "border-accent/30"
                                  : "border-white/10"
                              )}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="font-medium text-white">{d.company}</div>
                                {d.next_action_at && new Date(d.next_action_at) < new Date() && (
                                  <div className="mt-0.5 size-2 shrink-0 rounded-full bg-accent" title="Follow-up überfällig" />
                                )}
                              </div>
                              {d.contact_name && (
                                <div className="mt-0.5 text-xs text-zinc-400">{d.contact_name}</div>
                              )}
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-accent">
                                  {d.deal_value ? fmtEur(d.deal_value) : "—"}
                                </span>
                                {d.next_action_at && new Date(d.next_action_at) >= new Date() && (
                                  <span className="text-[10px] text-zinc-500">
                                    {new Date(d.next_action_at).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
                                  </span>
                                )}
                              </div>
                            </Link>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {showNew && <NewDealDialog onClose={() => setShowNew(false)} onCreated={(d) => setDeals((ds) => [d, ...ds])} />}
    </div>
  );
}
