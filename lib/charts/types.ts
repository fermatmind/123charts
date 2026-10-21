export type Locale = "en" | "zh";
export type Dataset = "demo" | "real";
export type PriceType = "free" | "freemium" | "trial" | "paid" | "unknown";
export interface Category {
  parent_en?: string;
  parent_zh?: string;
  rules_version?: number;
  slug: string;
  name_en: string;
  name_zh: string;
  description_en: string;
  description_zh: string;
}
export interface Membership {
  project_id: string;
  category: string;
  state: string;
  placement: string;
  basis: string;
  reviewed_at: string | null;
}
export interface VerificationCheck {
  domain: string;
  source: string;
  month: string;
  scope: string;
  demo: boolean;
  state: string;
  next_check_at: string;
  last_attempt_at: string | null;
  last_success_at: string | null;
}
export interface VerificationTask extends VerificationCheck {
  source_evidence_id?: string | null;
  id: string;
  evidence_id: string | null;
  priority: number;
  attempts: number;
  actual_calls: number;
  error: string | null;
}
export interface VerificationReceipt {
  id: string;
  task_id: string;
  source_url: string;
  response_hash: string | null;
  extracted: TrafficFields | null;
  outcome: string;
  detail: string;
  actual_calls: number;
  cost_usd: number;
  attempted_at: string;
  success_at: string | null;
  traffic_id: string | null;
}
export interface Project {
  first_indexed_at?: string | null;
  review_state?: "pending" | "approved" | "reference";
  content_version?: number;
  task?: string;
  supported_languages?: string[];
  differentiator?: string;
  conditions?: string;
  is_open_source?: boolean;
  open_source_url?: string;
  first_published_at?: string | null;
  first_publication_inferred?: boolean;

  id: string;
  slug: string;
  name: string;
  website_url: string;
  domain: string;
  measurement_domain: string;
  category: string;
  description_en: string;
  description_zh: string;
  price_type: PriceType;
  price_verified?: boolean;
  owner_verified?: boolean;
  publication: string;
  collected_at: string;
  enrolled_at: string | null;
  controller_id: string | null;
  official_source: string | null;
  source_checked_at: string | null;
  demo: boolean;
  updated_at: string;
}
export interface Peer {
  domain: string;
  name: string;
  task: string;
  rationale: string;
}
export interface Draft {
  replace_peer_group?: boolean;
  task?: string;
  supported_languages?: string[];
  differentiator?: string;
  conditions?: string;
  is_open_source?: boolean;
  open_source_url?: string;
  first_published_at?: string | null;
  first_publication_inferred?: boolean;
  peer_exception_reason?: string;
  supplementary_alternatives?: string;

  name: string;
  slug: string;
  website_url: string;
  domain: string;
  category: string;
  price_type: PriceType;
  description_en: string;
  description_zh: string;
  peers: Peer[];
}
export interface Application {
  id: string;
  owner_id: string;
  project_id: string | null;
  kind: "initial" | "update";
  draft: Draft;
  status: string;
  feedback: string | null;
  demo: boolean;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}
export interface Evidence {
  id: string;
  application_id: string;
  owner_id: string;
  peer_domain: string;
  original_name: string;
  storage_path: string;
  state: string;
  raw_text: string | null;
  extracted: TrafficFields | null;
  review_channel: string | null;
  review_reference: string | null;
  review_note: string | null;
  traffic_id: string | null;
  demo: boolean;
  created_at: string;
}
export interface TrafficFields {
  domain: string;
  source: string;
  month: string;
  metric: string;
  scope: string;
  value: number | null;
  unit?: string;
  raw_display?: string | null;
  precision_step?: number;
}
export interface Traffic extends TrafficFields {
  raw_display?: string | null;
  precision_step?: number;
  id: string;
  value: number;
  version: number;
  state: string;
  demo: boolean;
  correction_note: string | null;
  verified_at: string;
}
export interface Snapshot {
  rule_version?: string;
  members?: string[];
  exclusions?: { project_id: string; reason: string }[];
  id: string;
  category: string;
  source: string;
  month: string;
  metric: string;
  scope: string;
  version: number;
  entries: SnapshotEntry[];
  coverage_count: number;
  total_count: number;
  correction_note: string | null;
  demo: boolean;
  created_at: string;
}
export interface SnapshotEntry {
  raw_display?: string;
  precision_step?: number;
  project_id: string;
  domain: string;
  value: number;
  rank: number;
  traffic_id: string;
  data_version: number;
}
export interface ReportPeer extends Peer {
  relationship_state: string;
  traffic: {
    value: number;
    month: string;
    source: string;
    scope: string;
    version: number;
    state: string;
  } | null;
}
export interface Report {
  id: string;
  application_id: string;
  owner_id: string;
  project_id: string;
  peers: ReportPeer[];
  share_token: string | null;
  demo: boolean;
  created_at: string;
}
export interface Relation extends Peer {
  public?: boolean;
  anchor_id?: string;
  candidate_id?: string;
  withdrawn_at?: string | null;
  id: string;
  application_id: string;
  project_id: string | null;
  peer_domain: string;
  peer_name: string;
  status: string;
  feedback: string | null;
}
export interface Claim {
  id: string;
  owner_id: string;
  project_id: string;
  evidence: string;
  method: string;
  state: string;
  feedback: string | null;
  created_at: string;
}
export interface Correction {
  id: string;
  owner_id: string;
  project_id: string;
  message: string;
  state: string;
  feedback: string | null;
  created_at: string;
}
export interface Follow {
  owner_id: string;
  target: string;
  kind: string;
  email_enabled: boolean;
}
export interface Notification {
  id: string;
  title_en: string;
  title_zh: string;
  body_en: string;
  body_zh: string;
  href: string;
  seen: boolean;
  created_at: string;
  email_sent_at: string | null;
}
export interface Recommendation {
  id: string;
  day: string;
  context: string;
  slot: number;
  reason: string;
  project_id: string;
  demo: boolean;
}
export interface Job {
  id: string;
  kind: string;
  owner_id: string | null;
  state: string;
  payload: Record<string, string>;
  result: Record<string, unknown> | null;
  error: string | null;
  attempts: number;
  created_at: string;
}
export interface Event {
  project_id: string;
  kind: string;
  excluded: boolean;
  exclusion_reason: string | null;
  visitor_id: string;
  surface: string;
  created_at: string;
}
export interface Bootstrap {
  managedProjects: Project[];
  discoveryCycle: import("./discovery").CycleEntry[];
  as_of: string;
  configured: boolean;
  categories: Category[];
  categoryFollowers: Record<string, number>;
  memberships: Membership[];
  checks: VerificationCheck[];
  verificationTasks: VerificationTask[];
  receipts: VerificationReceipt[];
  verificationSettings: Record<string, any> | null;
  projects: Project[];
  researchQueue: Project[];
  traffic: Traffic[];
  snapshots: Snapshot[];
  months: {
    source: string;
    month: string;
    demo: boolean;
    accepted: boolean;
    reference: string;
  }[];
  recommendations: Recommendation[];
  user: { id: string; email: string } | null;
  isAdmin: boolean;
  applications: Application[];
  evidence: Evidence[];
  relations: Relation[];
  reports: Report[];
  claims: Claim[];
  corrections: Correction[];
  follows: Follow[];
  notifications: Notification[];
  jobs: Job[];
  events: Event[];
}
export const emptyBootstrap: Bootstrap = {
  managedProjects: [],
  discoveryCycle: [],
  as_of: "1970-01-01T00:00:00Z",
  configured: false,
  categories: [],
  categoryFollowers: {},
  memberships: [],
  checks: [],
  verificationTasks: [],
  receipts: [],
  verificationSettings: null,
  projects: [],
  researchQueue: [],
  traffic: [],
  snapshots: [],
  months: [],
  recommendations: [],
  user: null,
  isAdmin: false,
  applications: [],
  evidence: [],
  relations: [],
  reports: [],
  claims: [],
  corrections: [],
  follows: [],
  notifications: [],
  jobs: [],
  events: [],
};
