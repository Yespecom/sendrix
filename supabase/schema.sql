-- ============================================================
--  SENDRIX — Complete Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. USERS
--    Synced from Supabase Auth.
--    Stores plan, Stripe billing, and founding member status.
-- ============================================================
create table if not exists public.users (
  id                      uuid primary key references auth.users(id) on delete cascade,
  email                   text,
  full_name               text,
  avatar_url              text,
  plan                    text not null default 'starter',   -- 'starter' | 'indie' | 'pro'
  founding_member         boolean not null default false,
  stripe_customer_id      text unique,
  stripe_subscription_status text,                           -- 'active' | 'canceled' | 'past_due' etc.
  stripe_price_id         text,
  next_billing_date       timestamptz,
  last_payment_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure update_updated_at();

-- Auto-create user row on auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 2. PRODUCTS (Workspaces)
--    One row per SaaS product a user is building.
--    `brief` stores the onboarding questionnaire answers as JSONB.
-- ============================================================
create table if not exists public.products (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null,
  brief       jsonb,    -- { product_name, target_user, core_problem, activation_action, upgrade_incentive, tone, emoji, description }
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_user_id_idx on public.products(user_id);

create trigger products_updated_at
  before update on public.products
  for each row execute procedure update_updated_at();


-- ============================================================
-- 3. SEQUENCES
--    One row per product. Stores the array of 6 generated emails.
-- ============================================================
create table if not exists public.sequences (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null unique references public.products(id) on delete cascade,
  emails      jsonb not null default '[]'::jsonb,   -- Array<{ subject, body, email_type, send_delay_days }>
  design_key  text not null default 'clean_minimal',
  status      text not null default 'draft',         -- 'draft' | 'active' | 'paused'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists sequences_product_id_idx on public.sequences(product_id);

create trigger sequences_updated_at
  before update on public.sequences
  for each row execute procedure update_updated_at();


-- ============================================================
-- 4. RESEND_CONFIG
--    One row per user. Stores their Resend API key (AES-256 encrypted)
--    and the from name/email they want to send as.
-- ============================================================
create table if not exists public.resend_config (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null unique references public.users(id) on delete cascade,
  api_key     text not null,         -- AES-256-GCM encrypted JSON string
  from_email  text not null,
  from_name   text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger resend_config_updated_at
  before update on public.resend_config
  for each row execute procedure update_updated_at();


-- ============================================================
-- 5. SUBSCRIBERS
--    One row per user who signed up via the product webhook.
-- ============================================================
create table if not exists public.subscribers (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  email       text not null,
  name        text,
  status      text not null default 'enrolled',   -- 'enrolled' | 'active' | 'unsubscribed' | 'bounced'
  created_at  timestamptz not null default now(),
  unique (product_id, email)
);

create index if not exists subscribers_product_id_idx on public.subscribers(product_id);
create index if not exists subscribers_email_idx on public.subscribers(email);


-- ============================================================
-- 6. EMAIL_LOGS
--    One row per email per subscriber. Tracks delivery state.
-- ============================================================
create table if not exists public.email_logs (
  id              uuid primary key default uuid_generate_v4(),
  subscriber_id   uuid not null references public.subscribers(id) on delete cascade,
  email_number    int not null,     -- index into sequences.emails array (0-5)
  status          text not null default 'pending',  -- 'pending' | 'sent' | 'failed'
  scheduled_at    timestamptz not null,
  sent_at         timestamptz,
  attempts        int not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists email_logs_subscriber_id_idx on public.email_logs(subscriber_id);
create index if not exists email_logs_status_scheduled_idx on public.email_logs(status, scheduled_at);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Users: can only see/edit their own row
alter table public.users enable row level security;
create policy "Users: own row only" on public.users
  using (auth.uid() = id) with check (auth.uid() = id);

-- Products: own only
alter table public.products enable row level security;
create policy "Products: own only" on public.products
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Sequences: own only (via product)
alter table public.sequences enable row level security;
create policy "Sequences: own only" on public.sequences
  using (
    exists (
      select 1 from public.products
      where products.id = sequences.product_id
        and products.user_id = auth.uid()
    )
  );

-- Resend config: own only
alter table public.resend_config enable row level security;
create policy "Resend config: own only" on public.resend_config
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Subscribers: product owner can read
alter table public.subscribers enable row level security;
create policy "Subscribers: product owner" on public.subscribers
  using (
    exists (
      select 1 from public.products
      where products.id = subscribers.product_id
        and products.user_id = auth.uid()
    )
  );

-- Email logs: product owner can read
alter table public.email_logs enable row level security;
create policy "Email logs: product owner" on public.email_logs
  using (
    exists (
      select 1 from public.subscribers
      join public.products on products.id = subscribers.product_id
      where subscribers.id = email_logs.subscriber_id
        and products.user_id = auth.uid()
    )
  );


-- ============================================================
-- SERVICE ROLE BYPASS
-- Webhook + cron routes use SUPABASE_SERVICE_ROLE_KEY which
-- bypasses RLS automatically — no extra config needed.
-- ============================================================


-- ============================================================
-- HELPER VIEW: subscriber & email stats per product
-- ============================================================
create or replace view public.product_stats as
select
  p.id          as product_id,
  p.name,
  p.user_id,
  count(distinct s.id) filter (where s.status != 'unsubscribed') as subscriber_count,
  count(el.id)  filter (where el.status = 'sent')    as emails_sent,
  count(el.id)  filter (where el.status = 'pending') as emails_pending
from public.products p
left join public.subscribers s  on s.product_id    = p.id
left join public.email_logs  el on el.subscriber_id = s.id
group by p.id, p.name, p.user_id;


-- ============================================================
-- DONE ✓
-- Tables:  users, products, sequences, resend_config,
--          subscribers, email_logs
-- View:    product_stats
-- Trigger: auto-create user row on auth signup
-- RLS:     enabled on all 6 tables
-- ============================================================
