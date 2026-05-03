"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, LayoutDashboard, LogOut, PhoneCall } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: PhoneCall },
  { href: "/pipeline", label: "Pipeline", icon: LayoutGrid },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const s = createClient();
    await s.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/pipeline" className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-accent shadow-glow-red" />
            <span className="text-sm font-semibold tracking-tight">SalesOS</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const active = pathname.startsWith(l.href);
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition",
                    active
                      ? "bg-white/[0.06] text-white"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                  )}
                >
                  <Icon className="size-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button onClick={logout} className="btn-ghost">
          <LogOut className="size-4" /> Abmelden
        </button>
      </div>
    </header>
  );
}
