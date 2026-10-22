-- 88CN Supabase Schema v0
-- Migration: 001_init
-- Description: Core schema for 88CN Free AI Project Growth Index
-- Date: 2026-06-15

-- =============================================================================
-- Section 1: Extensions
-- =============================================================================
create extension if not exists "pgcrypto" with schema extensions;

-- =============================================================================
-- Section 2: Helper Functions
-- =============================================================================

-- Auto-update updated_at column
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Admin check (placeholder — real admin check will use auth.uid() + admin role)
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Phase 1: admin check via service_role or claim in future
  -- This placeholder returns true only for service_role
  return coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'role' = 'service_role',
    false
  );
end;
$$;

-- =============================================================================
-- Section 3: System Controls
-- =============================================================================

create table public.system_flags (
  flag_name text primary key,
  enabled boolean not null default false,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Default flag values (inserted via migration, not runtime config)
insert into public.system_flags (flag_name, enabled, description) values
  ('disable_external_refresh', false, 'Pause all external source refresh jobs'),
  ('disable_editorial_generation', false, 'Pause AI editorial draft generation'),
  ('disable_score_recalculation', false, 'Pause Signal Score recalculation'),
  ('disable_new_submissions', false, 'Reject new project submissions'),
  ('disable_watchlist_writes', false, 'Pause watchlist write operations'),
  ('read_only_mode', false, 'Reject all writes');

-- Daily budget tracking table
create table public.system_budgets (
  budget_name text primary key,
  daily_limit int not null default 0,
  current_usage int not null default 0,
  last_reset_date date not null default current_date,
  is_exhausted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.system_budgets (budget_name, daily_limit) values
  ('job_count', 200),
  ('external_api_requests', 500),
  ('editorial_generation', 20),
  ('supabase_writes', 1000);

-- =============================================================================
-- Section 4: Core Content Tables
-- =============================================================================

-- Categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  overview text,
  why_matters text,
  index_status text not null default 'noindex'
    check (index_status in ('noindex', 'preview_noindex', 'indexable')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- Collections table
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  inclusion_criteria text,
  editorial_summary text,
  index_status text not null default 'noindex'
    check (index_status in ('noindex', 'preview_noindex', 'indexable')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_collections_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

-- Reports table
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  report_date date not null default current_date,
  executive_summary text,
  index_status text not null default 'noindex'
    check (index_status in ('noindex', 'preview_noindex', 'indexable')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_reports_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

-- Projects table (core entity)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  category_id uuid references public.categories(id),
  website_url text,
  github_url text,
  docs_url text,
  launch_url text,
  status text not null default 'submitted'
    check (status in (
      'draft',
      'submitted',
      'pending_review',
      'approved',
      'published',
      'claimed',
      'owner_verified',
      'inactive_warning',
      'candidate_archive',
      'archived_research',
      'archived_noindex',
      'rejected_spam'
    )),
  index_status text not null default 'noindex'
    check (index_status in (
      'noindex',
      'preview_noindex',
      'indexable',
      'archived_indexable'
    )),
  claim_status text not null default 'unclaimed'
    check (claim_status in ('unclaimed', 'claimed', 'owner_verified')),
  founder_name text,
  founder_social_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Section 5: Project Source and Snapshot Tables
-- =============================================================================

-- Project public sources
create table public.project_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_type text not null
    check (source_type in ('website', 'github', 'docs', 'pricing', 'launch', 'social')),
  source_url text not null,
  is_active boolean not null default true,
  last_fetched_at timestamptz,
  last_success_at timestamptz,
  is_stale boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, source_type, source_url)
);
create trigger trg_project_sources_updated_at
  before update on public.project_sources
  for each row execute function public.set_updated_at();

-- Normalized source snapshots (long-term storage)
create table public.project_source_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_source_id uuid not null references public.project_sources(id) on delete cascade,
  normalized_payload jsonb not null,
  snapshot_taken_at timestamptz not null default now(),
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

-- Raw payloads (short-term storage, bounded retention)
create table public.project_raw_payloads (
  id uuid primary key default gen_random_uuid(),
  project_source_id uuid not null references public.project_sources(id) on delete cascade,
  raw_summary text,
  raw_pointer text,              -- object storage path or external reference
  raw_size_bytes int,
  expires_at timestamptz not null, -- required retention bound
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Section 6: Score Tables
-- =============================================================================

-- Latest Signal Score per project
create table public.project_scores (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  signal_score int not null default 0 check (signal_score >= 0 and signal_score <= 100),
  product_readiness int not null default 0 check (product_readiness >= 0 and product_readiness <= 100),
  dev_momentum int not null default 0 check (dev_momentum >= 0 and dev_momentum <= 100),
  market_presence int not null default 0 check (market_presence >= 0 and market_presence <= 100),
  commercial_readiness int not null default 0 check (commercial_readiness >= 0 and commercial_readiness <= 100),
  seo_foundation int not null default 0 check (seo_foundation >= 0 and seo_foundation <= 100),
  trust_confidence int not null default 0 check (trust_confidence >= 0 and trust_confidence <= 100),
  source_confidence text not null default 'not_enough_data'
    check (source_confidence in (
      'verified', 'public_signals', 'not_enough_data',
      'founder_not_claimed', 'source_unavailable'
    )),
  stale_sources int not null default 0,
  missing_sources int not null default 0,
  calculation_version text not null default 'v0',
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_project_scores_updated_at
  before update on public.project_scores
  for each row execute function public.set_updated_at();

-- Score history snapshots
create table public.project_score_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  signal_score int not null default 0,
  product_readiness int not null default 0,
  dev_momentum int not null default 0,
  market_presence int not null default 0,
  commercial_readiness int not null default 0,
  seo_foundation int not null default 0,
  trust_confidence int not null default 0,
  source_confidence text not null,
  calculation_version text not null default 'v0',
  snapshot_taken_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Section 7: Structured Profile
-- =============================================================================

create table public.project_structured_profiles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  schema_type text not null default 'SoftwareApplication'
    check (schema_type in ('SoftwareApplication', 'WebApplication', 'CreativeWork')),
  structured_data_json jsonb not null default '{}'::jsonb,
  target_users text,
  pricing_model text,
  public_sources jsonb not null default '[]'::jsonb,
  same_as_urls jsonb not null default '[]'::jsonb,
  source_confidence text not null default 'not_enough_data',
  human_approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_project_structured_profiles_updated_at
  before update on public.project_structured_profiles
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Section 8: Submit / Claim / External Import
-- =============================================================================

-- Project submissions (anonymous insert allowed)
create table public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text,
  website_url text,
  github_url text,
  category_slug text,
  submitter_note text,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected', 'duplicate')),
  reviewer_notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_project_submissions_updated_at
  before update on public.project_submissions
  for each row execute function public.set_updated_at();

-- Project claims (anonymous insert allowed)
create table public.project_claims (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id),
  submission_id uuid references public.project_submissions(id),
  claim_method text not null
    check (claim_method in ('domain_email', 'dns_txt', 'github_repo', 'manual_review')),
  claim_evidence text,               -- domain, DNS record, GitHub proof
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'approved', 'rejected')),
  reviewer_notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_project_claims_updated_at
  before update on public.project_claims
  for each row execute function public.set_updated_at();

-- External project imports (staging — must not write directly to projects)
create table public.external_project_imports (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text,
  import_payload jsonb not null,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected', 'partial', 'error')),
  normalized_project_id uuid references public.projects(id),
  reviewer_notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_external_project_imports_updated_at
  before update on public.external_project_imports
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Section 9: Editorial Pipeline
-- =============================================================================

create table public.project_editorial_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  status text not null default 'pending'
    check (status in (
      'pending', 'generating', 'draft_ready',
      'approved', 'rejected', 'failed'
    )),
  draft_editorial_note text,
  draft_growth_opportunity text,
  draft_seo_gap_note text,
  draft_ad_readiness_note text,
  model_provider text,
  model_name text,
  prompt_version text,
  hallucination_risk text
    check (hallucination_risk in ('low', 'medium', 'high', 'unknown')),
  input_snapshot jsonb,
  human_approved_at timestamptz,
  human_approved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_project_editorial_jobs_updated_at
  before update on public.project_editorial_jobs
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Section 10: Founder Value / Badge / Consent
-- =============================================================================

-- Project badges (e.g. Genesis Badge)
create table public.project_badges (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  badge_type text not null
    check (badge_type in ('genesis', 'verified_signal', 'founder_claimed')),
  is_active boolean not null default true,
  awarded_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_project_badges_updated_at
  before update on public.project_badges
  for each row execute function public.set_updated_at();

-- Project consent flags
create table public.project_consents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  public_website_scan boolean not null default false,
  public_pricing_scan boolean not null default false,
  github_signal_scan boolean not null default false,
  ad_readiness_scan boolean not null default false,
  structured_profile_exposure boolean not null default false,
  public_api_exposure boolean not null default false,
  future_mcp_exposure boolean not null default false,
  future_verified_data_contact boolean not null default false,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id)
);
create trigger trg_project_consents_updated_at
  before update on public.project_consents
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Section 11: Lifecycle Events
-- =============================================================================

create table public.project_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  from_status text not null,
  to_status text not null,
  reason text,
  performed_by text,
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Section 12: Async Refresh Jobs
-- =============================================================================

create table public.source_refresh_jobs (
  id uuid primary key default gen_random_uuid(),
  project_source_id uuid not null references public.project_sources(id) on delete cascade,
  job_type text not null
    check (job_type in ('website_fetch', 'github_fetch', 'docs_fetch', 'pricing_fetch', 'social_fetch')),
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  priority int not null default 0 check (priority >= 0 and priority <= 10),
  attempts int not null default 0,
  max_attempts int not null default 3,
  locked_at timestamptz,
  locked_by text,
  run_after timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  last_error text,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_source_refresh_jobs_updated_at
  before update on public.source_refresh_jobs
  for each row execute function public.set_updated_at();

-- Claim batch of source_refresh_jobs using FOR UPDATE SKIP LOCKED
-- Never scans the full table — claims at most batch_size pending jobs
create or replace function public.claim_source_refresh_jobs(
  batch_size int default 20,
  worker_id text default 'default'
)
returns setof public.source_refresh_jobs
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
    with claimed as (
      select id
      from public.source_refresh_jobs
      where status = 'pending'
        and run_after <= now()
      order by priority desc, created_at asc
      limit batch_size
      for update skip locked
    )
    update public.source_refresh_jobs j
    set
      status = 'in_progress',
      locked_at = now(),
      locked_by = worker_id,
      started_at = now(),
      attempts = attempts + 1
    from claimed
    where j.id = claimed.id
    returning j.*;
end;
$$;


-- =============================================================================
-- Section 13: Indexes
-- =============================================================================

-- Projects
create index idx_projects_status on public.projects(status);
create index idx_projects_index_status on public.projects(index_status);
create index idx_projects_category_id on public.projects(category_id);
create index idx_projects_claim_status on public.projects(claim_status);

-- Project sources
create index idx_project_sources_project_id on public.project_sources(project_id);
create index idx_project_sources_is_active on public.project_sources(is_active);
create index idx_project_sources_is_stale on public.project_sources(is_stale);

-- Snapshots
create index idx_project_source_snapshots_source_id on public.project_source_snapshots(project_source_id);
create index idx_project_source_snapshots_is_current on public.project_source_snapshots(is_current) where is_current = true;

-- Raw payloads
create index idx_project_raw_payloads_source_id on public.project_raw_payloads(project_source_id);
create index idx_project_raw_payloads_expires_at on public.project_raw_payloads(expires_at);

-- Scores
create index idx_project_scores_project_id on public.project_scores(project_id);
create index idx_project_scores_signal_score on public.project_scores(signal_score desc);
create index idx_project_score_snapshots_project_id on public.project_score_snapshots(project_id);

-- Structured profiles
create index idx_project_structured_profiles_human_approved on public.project_structured_profiles(human_approved_at)
  where human_approved_at is not null;

-- Editorial
create index idx_project_editorial_jobs_project_id on public.project_editorial_jobs(project_id);
create index idx_project_editorial_jobs_status on public.project_editorial_jobs(status);

-- Refresh jobs
create index idx_source_refresh_jobs_status on public.source_refresh_jobs(status);
create index idx_source_refresh_jobs_run_after on public.source_refresh_jobs(run_after);
create index idx_source_refresh_jobs_priority on public.source_refresh_jobs(priority desc);
create index idx_source_refresh_jobs_locked on public.source_refresh_jobs(locked_at)
  where locked_at is not null;

-- Lifecycle
create index idx_project_lifecycle_events_project_id on public.project_lifecycle_events(project_id);

-- Claims
create index idx_project_claims_project_id on public.project_claims(project_id);
create index idx_project_claims_status on public.project_claims(status);

-- Submissions
create index idx_project_submissions_status on public.project_submissions(status);

-- External imports
create index idx_external_project_imports_status on public.external_project_imports(status);

-- =============================================================================
-- Section 14: Row-Level Security (RLS)
-- =============================================================================

-- Enable RLS on all tables
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.reports enable row level security;
alter table public.projects enable row level security;
alter table public.project_sources enable row level security;
alter table public.project_source_snapshots enable row level security;
alter table public.project_raw_payloads enable row level security;
alter table public.project_scores enable row level security;
alter table public.project_score_snapshots enable row level security;
alter table public.project_structured_profiles enable row level security;
alter table public.project_submissions enable row level security;
alter table public.project_claims enable row level security;
alter table public.external_project_imports enable row level security;
alter table public.project_editorial_jobs enable row level security;
alter table public.project_badges enable row level security;
alter table public.project_consents enable row level security;
alter table public.project_lifecycle_events enable row level security;
alter table public.source_refresh_jobs enable row level security;
alter table public.system_flags enable row level security;
alter table public.system_budgets enable row level security;

-- -------------------------------------------------------------------------
-- Public Read: Categories — indexable only
-- -------------------------------------------------------------------------
create policy "categories_select_indexable"
  on public.categories
  for select
  to anon
  using (index_status = 'indexable');

create policy "categories_select_admin"
  on public.categories
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Public Read: Collections — indexable only
-- -------------------------------------------------------------------------
create policy "collections_select_indexable"
  on public.collections
  for select
  to anon
  using (index_status = 'indexable');

create policy "collections_select_admin"
  on public.collections
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Public Read: Reports — indexable only
-- -------------------------------------------------------------------------
create policy "reports_select_indexable"
  on public.reports
  for select
  to anon
  using (index_status = 'indexable');

create policy "reports_select_admin"
  on public.reports
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Projects — public read only indexable published/claimed/verified
-- -------------------------------------------------------------------------
create policy "projects_select_public"
  on public.projects
  for select
  to anon
  using (
    status in ('published', 'claimed', 'owner_verified', 'archived_research')
    and index_status in ('indexable', 'archived_indexable')
  );

create policy "projects_select_admin"
  on public.projects
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Sources — no public read
-- -------------------------------------------------------------------------
create policy "project_sources_select_admin"
  on public.project_sources
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Source Snapshots — no public read
-- -------------------------------------------------------------------------
create policy "project_source_snapshots_select_admin"
  on public.project_source_snapshots
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Raw Payloads — no public read
-- -------------------------------------------------------------------------
create policy "project_raw_payloads_select_admin"
  on public.project_raw_payloads
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Scores — read via public project reference
-- -------------------------------------------------------------------------
create policy "project_scores_select_public"
  on public.project_scores
  for select
  to anon
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_scores.project_id
        and p.status in ('published', 'claimed', 'owner_verified', 'archived_research')
        and p.index_status in ('indexable', 'archived_indexable')
    )
  );

create policy "project_scores_select_admin"
  on public.project_scores
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Score Snapshots — read via public project reference
-- -------------------------------------------------------------------------
create policy "project_score_snapshots_select_public"
  on public.project_score_snapshots
  for select
  to anon
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_score_snapshots.project_id
        and p.status in ('published', 'claimed', 'owner_verified', 'archived_research')
        and p.index_status in ('indexable', 'archived_indexable')
    )
  );

create policy "project_score_snapshots_select_admin"
  on public.project_score_snapshots
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Structured Profiles — read only human-approved + public project
-- -------------------------------------------------------------------------
create policy "project_structured_profiles_select_public"
  on public.project_structured_profiles
  for select
  to anon
  using (
    human_approved_at is not null
    and exists (
      select 1 from public.projects p
      where p.id = project_structured_profiles.project_id
        and p.status in ('published', 'claimed', 'owner_verified', 'archived_research')
        and p.index_status in ('indexable', 'archived_indexable')
    )
  );

create policy "project_structured_profiles_select_admin"
  on public.project_structured_profiles
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Submissions — anonymous insert allowed, no select
-- -------------------------------------------------------------------------
create policy "project_submissions_insert_anon"
  on public.project_submissions
  for insert
  to anon
  with check (true);

create policy "project_submissions_select_admin"
  on public.project_submissions
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Claims — anonymous insert allowed, no select
-- -------------------------------------------------------------------------
create policy "project_claims_insert_anon"
  on public.project_claims
  for insert
  to anon
  with check (true);

create policy "project_claims_select_admin"
  on public.project_claims
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- External Project Imports — no public access
-- -------------------------------------------------------------------------
create policy "external_project_imports_select_admin"
  on public.external_project_imports
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Editorial Jobs — no public access
-- -------------------------------------------------------------------------
create policy "project_editorial_jobs_select_admin"
  on public.project_editorial_jobs
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Badges — read via public project reference
-- -------------------------------------------------------------------------
create policy "project_badges_select_public"
  on public.project_badges
  for select
  to anon
  using (
    is_active = true
    and exists (
      select 1 from public.projects p
      where p.id = project_badges.project_id
        and p.status in ('published', 'claimed', 'owner_verified', 'archived_research')
        and p.index_status in ('indexable', 'archived_indexable')
    )
  );

create policy "project_badges_select_admin"
  on public.project_badges
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Source Refresh Jobs — no public access
-- -------------------------------------------------------------------------
create policy "source_refresh_jobs_select_admin"
  on public.source_refresh_jobs
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- System Flags — no public access
-- -------------------------------------------------------------------------
create policy "system_flags_select_admin"
  on public.system_flags
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- System Budgets — no public access
-- -------------------------------------------------------------------------
create policy "system_budgets_select_admin"
  on public.system_budgets
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Consents — no public access
-- -------------------------------------------------------------------------
create policy "project_consents_select_admin"
  on public.project_consents
  for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------------------
-- Project Lifecycle Events — read via public project reference
-- -------------------------------------------------------------------------
create policy "project_lifecycle_events_select_public"
  on public.project_lifecycle_events
  for select
  to anon
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_lifecycle_events.project_id
        and p.status in ('published', 'claimed', 'owner_verified', 'archived_research')
        and p.index_status in ('indexable', 'archived_indexable')
    )
  );

create policy "project_lifecycle_events_select_admin"
  on public.project_lifecycle_events
  for select
  to authenticated
  using (public.is_admin());
