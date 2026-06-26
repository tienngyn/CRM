"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AppearancePanel } from "@/components/appearance-panel";
import { useAppearance } from "@/components/theme-provider";
import {
  LayoutDashboard,
  PhoneCall,
  LayoutGrid,
  CalendarDays,
  BarChart2,
  LogOut,
  Palette,
  Eye,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Outreach", icon: PhoneCall },
  { href: "/pipeline", label: "Pipeline", icon: LayoutGrid },
  { href: "/calendar", label: "Kalender", icon: CalendarDays },
  { href: "/stats", label: "Statistiken", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const { focus, setFocus } = useAppearance();

  async function logout() {
    const s = createClient();
    await s.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-white/5 bg-bg-elevated">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="size-2 rounded-full bg-accent shadow-glow-red" />
        <span className="text-sm font-semibold tracking-tight">SalesOS</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {links.map((l) => {
          const active = pathname.startsWith(l.href);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-accent")} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-white/5 p-3">
        <button
          onClick={() => setFocus(!focus)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
            focus
              ? "bg-accent/10 text-accent"
              : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
          )}
        >
          <Eye className="size-4 shrink-0" />
          Fokus-Modus
        </button>
        <button
          onClick={() => setPanelOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <Palette className="size-4 shrink-0" />
          Darstellung
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <LogOut className="size-4 shrink-0" />
          Abmelden
        </button>
      </div>

      <AppearancePanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </aside>
  );
}
