import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STAGES = [
  { id: "cold", label: "Cold Call", description: "Termin verkaufen", color: "#38bdf8" },
  { id: "discovery", label: "Discovery", description: "Qualifizierung", color: "#a78bfa" },
  { id: "proposal", label: "Proposal", description: "Angebot präsentieren", color: "#f59e0b" },
  { id: "closing", label: "Closing", description: "Unterschrift & Anzahlung", color: "#fb7185" },
  { id: "kickoff", label: "Kick-off", description: "Daten sammeln", color: "#34d399" },
  { id: "active", label: "Active", description: "In Umsetzung", color: "#22c55e" },
] as const;

export type Stage = (typeof STAGES)[number]["id"];

export function fmtEur(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

export function fmtDateTime(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export const CALL_OUTCOMES = [
  { id: "no_answer", label: "Nicht erreicht", color: "zinc" },
  { id: "callback", label: "Rückruf vereinbart", color: "amber" },
  { id: "scheduled", label: "Termin gemacht", color: "emerald" },
  { id: "not_interested", label: "Kein Interesse", color: "red" },
] as const;

export const DAILY_CALL_GOAL = 30;
