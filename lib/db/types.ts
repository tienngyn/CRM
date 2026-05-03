import type { Stage } from "@/lib/utils";

export type Deal = {
  id: string;
  user_id: string;
  company: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  source: string | null;
  hook_note: string | null;
  stage: Stage;
  deal_value: number | null;
  next_action_at: string | null;
  discovery_at: string | null;
  follow_up_note: string | null;
  created_at: string;
  updated_at: string;
};

export type CallOutcome = "no_answer" | "scheduled" | "not_interested" | "callback";

export type CallLog = {
  id: string;
  deal_id: string;
  user_id: string;
  called_at: string;
  duration_seconds: number | null;
  outcome: CallOutcome;
  notes: string | null;
  created_at: string;
};

export type DiscoveryNote = {
  deal_id: string;
  goal: string | null;
  customer_lifetime_value: string | null;
  main_pain: string | null;
  decision_maker: string | null;
  budget_indication: string | null;
  notes: string | null;
};

export type Proposal = {
  deal_id: string;
  pdf_url: string | null;
  loom_url: string | null;
  price: number | null;
  sent_at: string | null;
  presented_at: string | null;
  status: string | null;
  notes: string | null;
};

export type Contract = {
  deal_id: string;
  signed_at: string | null;
  signature_url: string | null;
  total_amount: number | null;
  deposit_amount: number | null;
  deposit_invoice_sent_at: string | null;
  deposit_paid_at: string | null;
};

export type Kickoff = {
  deal_id: string;
  hosting_creds_received: boolean;
  domain_access_received: boolean;
  assets_received: boolean;
  texts_received: boolean;
  logo_received: boolean;
  next_feedback_at: string | null;
  notes: string | null;
};

export type Activity = {
  id: string;
  deal_id: string;
  user_id: string;
  type: string;
  body: string | null;
  created_at: string;
};
