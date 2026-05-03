"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <div className="size-2 rounded-full bg-accent shadow-glow-red" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
              SalesOS
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Willkommen zurück</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Magic Link an deine Mail — kein Passwort nötig.
          </p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center">
              <div className="mb-3 text-2xl">📧</div>
              <p className="text-sm text-zinc-300">
                Link an <span className="font-medium text-white">{email}</span> gesendet.
              </p>
              <p className="mt-2 text-xs text-zinc-500">Postfach prüfen.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="label">E-Mail</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="du@beispiel.de"
                />
              </div>
              {error && (
                <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
                  {error}
                </div>
              )}
              <button className="btn-primary w-full" disabled={loading}>
                {loading ? "Sende…" : "Magic Link senden"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
