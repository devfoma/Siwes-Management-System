create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null,
  role text not null check (role in ('STUDENT', 'SUPERVISOR', 'ADMIN')),
  created_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '');

create index if not exists profiles_email_idx
on public.profiles(email);

create table if not exists public.supervisor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  staff_id text unique,
  faculty text,
  department text,
  designation text,
  supervisor_type text not null default 'ACADEMIC' check (supervisor_type in ('ACADEMIC', 'INDUSTRY')),
  created_at timestamptz not null default now()
);

alter table public.supervisor_profiles
add column if not exists faculty text;

alter table public.supervisor_profiles
add column if not exists user_id uuid references public.profiles(id) on delete cascade;

alter table public.supervisor_profiles
add column if not exists staff_id text;

alter table public.supervisor_profiles
add column if not exists department text;

alter table public.supervisor_profiles
add column if not exists designation text;

alter table public.supervisor_profiles
add column if not exists supervisor_type text not null default 'ACADEMIC';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'supervisor_profiles'
      and column_name = 'id'
      and udt_name = 'uuid'
  ) then
    execute 'update public.supervisor_profiles set user_id = id where user_id is null';
  end if;
end $$;

create unique index if not exists supervisor_profiles_user_id_key
on public.supervisor_profiles(user_id);

create unique index if not exists supervisor_profiles_staff_id_key
on public.supervisor_profiles(staff_id)
where staff_id is not null;

create table if not exists public.student_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  matric_no text unique,
  department text,
  faculty text,
  organization_name text,
  organization_address text,
  latitude double precision,
  longitude double precision,
  supervisor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.student_profiles
add column if not exists faculty text;

alter table public.student_profiles
add column if not exists user_id uuid references public.profiles(id) on delete cascade;

alter table public.student_profiles
add column if not exists matric_no text;

alter table public.student_profiles
add column if not exists department text;

alter table public.student_profiles
add column if not exists organization_name text;

alter table public.student_profiles
add column if not exists organization_address text;

alter table public.student_profiles
add column if not exists latitude double precision;

alter table public.student_profiles
add column if not exists longitude double precision;

alter table public.student_profiles
add column if not exists supervisor_id uuid references public.profiles(id) on delete set null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_profiles'
      and column_name = 'id'
      and udt_name = 'uuid'
  ) then
    execute 'update public.student_profiles set user_id = id where user_id is null';
  end if;
end $$;

create unique index if not exists student_profiles_user_id_key
on public.student_profiles(user_id);

create unique index if not exists student_profiles_matric_no_key
on public.student_profiles(matric_no)
where matric_no is not null;

create table if not exists public.logbook_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  tasks_performed text not null,
  skills_acquired text not null,
  image_url text,
  ai_status text not null default 'PENDING' check (ai_status in ('PENDING', 'CRITICAL', 'COMPLIANT', 'WARNING')),
  ai_summary text,
  ai_details jsonb,
  supervisor_status text not null default 'PENDING' check (supervisor_status in ('PENDING', 'APPROVED', 'REJECTED')),
  supervisor_feedback text,
  submitted_at timestamptz not null default now()
);

create table if not exists public.supervision_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  supervisor_id uuid not null references public.profiles(id) on delete cascade,
  scheduled_time timestamptz not null,
  room_id text not null unique,
  session_status text not null default 'SCHEDULED' check (session_status in ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.call_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.supervision_sessions(room_id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.supervisor_profiles enable row level security;
alter table public.logbook_entries enable row level security;
alter table public.supervision_sessions enable row level security;
alter table public.call_messages enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

create or replace function public.supervises_student(student_profile_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.student_profiles sp
    where sp.user_id = student_profile_id and sp.supervisor_id = auth.uid()
  );
$$;

drop policy if exists "profiles_select_own_or_related" on public.profiles;
create policy "profiles_select_own_or_related"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.student_profiles sp
    where sp.user_id = profiles.id and sp.supervisor_id = auth.uid()
  )
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "student_profiles_select_own_supervisor_admin" on public.student_profiles;
create policy "student_profiles_select_own_supervisor_admin"
on public.student_profiles for select
to authenticated
using (student_profiles.user_id = auth.uid() or student_profiles.supervisor_id = auth.uid() or public.is_admin());

drop policy if exists "student_profiles_insert_own" on public.student_profiles;
create policy "student_profiles_insert_own"
on public.student_profiles for insert
to authenticated
with check (student_profiles.user_id = auth.uid());

drop policy if exists "student_profiles_update_own_or_admin" on public.student_profiles;
create policy "student_profiles_update_own_or_admin"
on public.student_profiles for update
to authenticated
using (student_profiles.user_id = auth.uid() or public.is_admin())
with check (student_profiles.user_id = auth.uid() or public.is_admin());

drop policy if exists "supervisor_profiles_select_related" on public.supervisor_profiles;
create policy "supervisor_profiles_select_related"
on public.supervisor_profiles for select
to authenticated
using (supervisor_profiles.user_id = auth.uid() or public.is_admin());

drop policy if exists "supervisor_profiles_admin_write" on public.supervisor_profiles;
create policy "supervisor_profiles_admin_write"
on public.supervisor_profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "logbook_select_own_or_supervisor" on public.logbook_entries;
create policy "logbook_select_own_or_supervisor"
on public.logbook_entries for select
to authenticated
using (student_id = auth.uid() or public.supervises_student(student_id) or public.is_admin());

drop policy if exists "logbook_insert_own" on public.logbook_entries;
create policy "logbook_insert_own"
on public.logbook_entries for insert
to authenticated
with check (student_id = auth.uid());

drop policy if exists "logbook_update_supervisor_or_admin" on public.logbook_entries;
create policy "logbook_update_supervisor_or_admin"
on public.logbook_entries for update
to authenticated
using (public.supervises_student(student_id) or public.is_admin())
with check (public.supervises_student(student_id) or public.is_admin());

drop policy if exists "sessions_select_participants" on public.supervision_sessions;
create policy "sessions_select_participants"
on public.supervision_sessions for select
to authenticated
using (student_id = auth.uid() or supervisor_id = auth.uid() or public.is_admin());

drop policy if exists "sessions_insert_supervisor_or_admin" on public.supervision_sessions;
create policy "sessions_insert_supervisor_or_admin"
on public.supervision_sessions for insert
to authenticated
with check (supervisor_id = auth.uid() or public.is_admin());

drop policy if exists "sessions_update_participants" on public.supervision_sessions;
create policy "sessions_update_participants"
on public.supervision_sessions for update
to authenticated
using (student_id = auth.uid() or supervisor_id = auth.uid() or public.is_admin())
with check (student_id = auth.uid() or supervisor_id = auth.uid() or public.is_admin());

drop policy if exists "call_messages_select_participants" on public.call_messages;
create policy "call_messages_select_participants"
on public.call_messages for select
to authenticated
using (
  exists (
    select 1 from public.supervision_sessions s
    where s.room_id = call_messages.room_id
    and (s.student_id = auth.uid() or s.supervisor_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "call_messages_insert_participants" on public.call_messages;
create policy "call_messages_insert_participants"
on public.call_messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.supervision_sessions s
    where s.room_id = call_messages.room_id
    and (s.student_id = auth.uid() or s.supervisor_id = auth.uid() or public.is_admin())
  )
);

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.student_profiles;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.supervisor_profiles;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.logbook_entries;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.supervision_sessions;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.call_messages;
exception
  when duplicate_object then null;
end $$;
