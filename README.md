# SalesOS

OS für deinen Vertriebsprozess (Webdesign-Business). 5-Phasen-Pipeline: Cold Call → Discovery → Proposal → Closing → Kick-off → Active.

Stack: Next.js 15 · Supabase · Tailwind · shadcn-Style.

## Setup

1. **Dependencies installieren**
   ```bash
   npm install
   ```

2. **Supabase einrichten**
   - In deinem Supabase-Projekt → SQL Editor → kompletten Inhalt von `lib/db/schema.sql` ausführen.
   - In Authentication → URL Configuration → Site URL = `http://localhost:3000`, Redirect URLs = `http://localhost:3000/auth/callback`.

3. **`.env.local` anlegen** (kopiere `.env.example`)
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

4. **Starten**
   ```bash
   npm run dev
   ```

5. Auf http://localhost:3000 mit deiner Mail einloggen → Magic Link → fertig.

## Struktur

- `/login` — Magic Link Login
- `/dashboard` — KPIs + nächste Aktionen
- `/pipeline` — Kanban-Board (Drag & Drop zwischen Phasen)
- `/deals/[id]` — Deal-Detail mit 5 Phase-Tabs

## Gate-Logik

DB-Trigger verhindert Stage `active`, solange:
- kein `signed_at` im Contract gesetzt ist, oder
- kein `deposit_paid_at` gesetzt ist.

Closing-Tab zeigt den Status visuell.
