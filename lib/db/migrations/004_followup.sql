-- Migration 004: Follow-up Notiz-Spalte
-- Im Supabase SQL Editor ausführen.

alter table deals add column if not exists follow_up_note text;
