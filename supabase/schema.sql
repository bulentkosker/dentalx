-- DentalX schema
-- Run this in the Supabase SQL editor (requires service role / owner privileges).

create table if not exists clinics (
  id text primary key,
  name text not null,
  slug text unique not null,
  city text not null,
  city_slug text not null,
  address text,
  lat decimal,
  lon decimal,
  phone text,
  website text,
  rating decimal,
  reviews_count integer,
  working_hours jsonb,
  photos jsonb default '[]'::jsonb,
  services jsonb default '[]'::jsonb,
  is_claimed boolean default false,
  claimed_by uuid references auth.users(id),
  claimed_at timestamptz,
  is_verified boolean default false,
  is_active boolean default true,
  source text default '2gis',
  raw_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists clinics_city_slug_idx on clinics (city_slug);
create index if not exists clinics_rating_idx on clinics (rating desc);

create table if not exists claim_requests (
  id uuid default gen_random_uuid() primary key,
  clinic_id text references clinics(id),
  user_id uuid references auth.users(id),
  contact_name text,
  contact_phone text,
  contact_email text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  clinic_id text references clinics(id),
  user_id uuid references auth.users(id),
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- RLS: public read on clinics, no public write
alter table clinics enable row level security;

drop policy if exists "clinics public read" on clinics;
create policy "clinics public read"
  on clinics for select
  using (true);
