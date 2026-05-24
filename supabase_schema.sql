-- ============================================================
-- CrowdIQ – Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES (linked to auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  org         text,
  role        text default 'viewer',
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, org, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'org',
    coalesce(new.raw_user_meta_data->>'role', 'viewer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. INCIDENTS
create table if not exists public.incidents (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  zone        text,
  type        text,
  severity    text default 'medium',
  status      text default 'open',
  description text,
  reported_by uuid references auth.users(id),
  created_at  timestamptz default now(),
  resolved_at timestamptz
);

alter table public.incidents enable row level security;

create policy "Authenticated users can read incidents"
  on public.incidents for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert incidents"
  on public.incidents for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update incidents"
  on public.incidents for update using (auth.role() = 'authenticated');

-- 3. ALERTS
create table if not exists public.alerts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  zone        text,
  type        text default 'warning',
  description text,
  resolved    boolean default false,
  created_at  timestamptz default now()
);

alter table public.alerts enable row level security;

create policy "Authenticated users can read alerts"
  on public.alerts for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert alerts"
  on public.alerts for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update alerts"
  on public.alerts for update using (auth.role() = 'authenticated');

-- 4. STAFF
create table if not exists public.staff (
  id          text primary key,
  name        text not null,
  role        text,
  zone        text,
  status      text default 'active',
  phone       text,
  avatar      text,
  created_at  timestamptz default now()
);

alter table public.staff enable row level security;

create policy "Authenticated users can read staff"
  on public.staff for select using (auth.role() = 'authenticated');

create policy "Authenticated users can update staff"
  on public.staff for update using (auth.role() = 'authenticated');

-- 5. DISPATCH LOG
create table if not exists public.dispatch_log (
  id          uuid primary key default gen_random_uuid(),
  staff_id    text references public.staff(id),
  message     text,
  sent_by     uuid references auth.users(id),
  created_at  timestamptz default now()
);

alter table public.dispatch_log enable row level security;

create policy "Authenticated users can read dispatch log"
  on public.dispatch_log for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert dispatch"
  on public.dispatch_log for insert with check (auth.role() = 'authenticated');

-- 6. ZONES (New Table)
create table if not exists public.zones (
  id          text primary key,
  name        text not null,
  capacity    integer not null,
  lat         double precision not null,
  lng         double precision not null,
  radius_meters integer default 50,
  density     integer default 50,
  created_at  timestamptz default now()
);

alter table public.zones enable row level security;

create policy "Authenticated users can read zones"
  on public.zones for select using (auth.role() = 'authenticated');

create policy "Authenticated users can write/update zones"
  on public.zones for all using (auth.role() = 'authenticated');

-- 7. VENDORS (New Table)
create table if not exists public.vendors (
  id          text primary key,
  name        text not null,
  zone        text not null,
  visits      integer default 0,
  revenue     integer default 0,
  wait_time   text,
  rating      numeric(3,2),
  status      text default 'safe',
  created_at  timestamptz default now()
);

alter table public.vendors enable row level security;

create policy "Authenticated users can read vendors"
  on public.vendors for select using (auth.role() = 'authenticated');

create policy "Authenticated users can write/update vendors"
  on public.vendors for all using (auth.role() = 'authenticated');

-- 8. PREDICTIONS (New Table)
create table if not exists public.predictions (
  id          uuid primary key default gen_random_uuid(),
  zone        text not null,
  risk        text not null,
  prediction  text not null,
  action      text not null,
  confidence  integer not null,
  created_at  timestamptz default now()
);

alter table public.predictions enable row level security;

create policy "Authenticated users can read predictions"
  on public.predictions for select using (auth.role() = 'authenticated');

-- 9. AUTOMATED ACTIONS (New Table)
create table if not exists public.automated_actions (
  id          uuid primary key default gen_random_uuid(),
  zone        text not null,
  title       text not null,
  description text not null,
  triggered_by text not null,
  created_at  timestamptz default now()
);

alter table public.automated_actions enable row level security;

create policy "Authenticated users can read automated actions"
  on public.automated_actions for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert automated actions"
  on public.automated_actions for insert with check (auth.role() = 'authenticated');

-- 10. ATTENDEE LOCATIONS (Real-time GPS tracking)
create table if not exists public.attendee_locations (
  id          uuid primary key default gen_random_uuid(),
  device_id   text not null,
  latitude    double precision not null,
  longitude   double precision not null,
  accuracy    double precision,
  zone_id     text,
  zone_name   text,
  event_id    text default 'current',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.attendee_locations enable row level security;

-- Allow ANYONE to insert (attendees are not authenticated)
create policy "Anyone can insert attendee locations"
  on public.attendee_locations for insert with check (true);

-- Allow ANYONE to read (for counting)
create policy "Anyone can read attendee locations"
  on public.attendee_locations for select using (true);

-- Allow ANYONE to update their own location
create policy "Anyone can update attendee locations"
  on public.attendee_locations for update using (true);

-- Allow ANYONE to delete their own location (check-out)
create policy "Anyone can delete attendee locations"
  on public.attendee_locations for delete using (true);

-- Also allow public read on zones (attendees need zone coordinates)
create policy "Anyone can read zones"
  on public.zones for select using (true);

-- 11. GATE SCANS (Entry/Exit counting)
create table if not exists public.gate_scans (
  id          uuid primary key default gen_random_uuid(),
  gate_name   text not null,
  scan_type   text not null default 'entry',
  ticket_id   text,
  scanned_by  uuid references auth.users(id),
  created_at  timestamptz default now()
);

alter table public.gate_scans enable row level security;

create policy "Authenticated users can read gate scans"
  on public.gate_scans for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert gate scans"
  on public.gate_scans for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- Seed Data – Populating all initial metrics and entries
-- ============================================================

-- Alerts Seed
insert into public.alerts (title, zone, type, description) values
  ('Overcrowding Detected', 'Main Stage', 'critical', 'Density exceeds 90% capacity'),
  ('Exit Bottleneck', 'Gate A', 'warning', 'Slow crowd movement detected'),
  ('Medical Standby', 'Food Court', 'info', 'Preventive measure active')
on conflict do nothing;

-- Staff Seed
insert into public.staff (id, name, role, zone, status, phone, avatar) values
  ('S01', 'Rajan Mehta', 'Security', 'North Entrance', 'active', '+91 98100 11111', 'RM'),
  ('S02', 'Priya Sharma', 'Medical', 'First Aid', 'active', '+91 98100 22222', 'PS'),
  ('S03', 'Arjun Verma', 'Volunteer', 'Main Stage', 'busy', '+91 98100 33333', 'AV'),
  ('S04', 'Kavita Singh', 'Cleaner', 'Food Court A', 'active', '+91 98100 44444', 'KS'),
  ('S05', 'Dev Nair', 'Security', 'South Exit', 'active', '+91 98100 55555', 'DN'),
  ('S06', 'Meena Joshi', 'Supervisor', 'Main Stage', 'active', '+91 98100 66666', 'MJ'),
  ('S07', 'Suresh Pillai', 'Security', 'Tech Expo Hall', 'offline', '+91 98100 77777', 'SP'),
  ('S08', 'Anita Roy', 'Medical', 'VIP Lounge', 'active', '+91 98100 88888', 'AR'),
  ('S09', 'Kiran Das', 'Volunteer', 'Workshop Zone', 'busy', '+91 98100 99999', 'KD'),
  ('S10', 'Vijay Reddy', 'Security', 'Parking A', 'active', '+91 98100 10101', 'VR')
on conflict (id) do nothing;

-- Zones Seed
insert into public.zones (id, name, capacity, lat, lng, radius_meters, density) values
  ('Z1', 'Main Stage', 2000, 19.0765, 72.8773, 80, 0),
  ('Z2', 'North Entrance', 800, 19.0780, 72.8768, 40, 0),
  ('Z3', 'Food Court A', 600, 19.0758, 72.8780, 50, 0),
  ('Z4', 'Tech Expo Hall', 1200, 19.0760, 72.8760, 70, 0),
  ('Z5', 'Workshop Zone', 400, 19.0748, 72.8775, 35, 0),
  ('Z6', 'South Exit', 600, 19.0750, 72.8763, 40, 0),
  ('Z7', 'VIP Lounge', 300, 19.0770, 72.8785, 30, 0),
  ('Z8', 'Parking A', 500, 19.0785, 72.8780, 60, 0),
  ('Z9', 'First Aid', 100, 19.0755, 72.8770, 20, 0),
  ('Z10', 'Media Centre', 200, 19.0762, 72.8790, 25, 0),
  ('Z11', 'Food Court B', 600, 19.0742, 72.8768, 50, 0),
  ('Z12', 'Emergency Gate', 400, 19.0775, 72.8758, 35, 0)
on conflict (id) do update set density = excluded.density, radius_meters = excluded.radius_meters;

-- Vendors Seed
insert into public.vendors (id, name, zone, visits, revenue, wait_time, rating, status) values
  ('V1', 'Chai Point', 'Food Court A', 1240, 62000, '12 min', 4.2, 'critical'),
  ('V2', 'Spice Garden', 'Food Court B', 890, 44500, '6 min', 4.5, 'moderate'),
  ('V3', 'TechGear Store', 'Tech Expo Hall', 2100, 315000, '3 min', 4.7, 'safe'),
  ('V4', 'BookNook', 'Workshop Zone', 340, 17000, '1 min', 4.1, 'safe'),
  ('V5', 'FreshJuice Hub', 'Food Court A', 560, 28000, '8 min', 4.3, 'moderate'),
  ('V6', 'Merch Central', 'Main Stage', 1780, 178000, '5 min', 4.6, 'moderate')
on conflict (id) do nothing;

-- Predictions Seed
insert into public.predictions (zone, risk, prediction, action, confidence) values
  ('Main Stage', 'HIGH', 'Exit rush likely in ~18 min after keynote ends', 'Pre-deploy 3 staff to south corridor', 92),
  ('Food Court A', 'HIGH', 'Queue will exceed 200 people in ~10 min', 'Open Food Court B overflow counter', 87),
  ('North Entrance', 'MEDIUM', 'Entry surge expected at 15:00 (workshop break)', 'Activate lane 3 and lane 4', 78),
  ('Tech Expo Hall', 'LOW', 'Density stable, slight increase post-2PM', 'Monitor but no immediate action needed', 85);
