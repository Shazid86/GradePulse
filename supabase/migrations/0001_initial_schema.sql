-- GradePulse — initial schema (Phase 1)
-- Apply in the Supabase SQL editor, or via `supabase db push` later.
-- Every table is owned by a single user (user_id) and protected by RLS.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- semesters
-- ---------------------------------------------------------------------------

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  academic_year text not null check (char_length(trim(academic_year)) between 1 and 40),
  start_date date not null,
  end_date date not null,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint semesters_date_order check (end_date >= start_date),
  constraint semesters_user_year_name_unique unique (user_id, academic_year, name)
);

create index semesters_user_id_idx on public.semesters (user_id);
create index semesters_user_status_idx on public.semesters (user_id, status);

create trigger semesters_set_updated_at
  before update on public.semesters
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  semester_id uuid not null references public.semesters (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  code text not null check (char_length(trim(code)) between 1 and 40),
  credits numeric(4, 1) not null check (credits > 0),
  instructor text, -- optional
  total_marks numeric(10, 2) not null check (total_marks > 0),
  passing_marks numeric(10, 2) not null check (passing_marks >= 0),
  -- Configurable grade → grade-point scale (never hard-coded in app code).
  -- Shape: [{ "grade": "A+", "min_percentage": 90, "grade_point": 4.0 }, ...]
  grading_scale jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_passing_within_total check (passing_marks <= total_marks)
);

create index courses_semester_id_idx on public.courses (semester_id);
create index courses_user_id_idx on public.courses (user_id);

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- assessment_categories
-- Configurable per course: e.g. "Class Tests" weight = 20 course marks.
-- ---------------------------------------------------------------------------

create table public.assessment_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  weight numeric(10, 2) not null default 0 check (weight >= 0),
  sort_order integer not null default 0,
  -- Aggregation rule for multiple assessments inside the category.
  -- 'equal' = obtained/max across assessments; extension point for future rules.
  aggregation text not null default 'equal'
    check (aggregation in ('equal', 'custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_categories_course_name_unique unique (course_id, name)
);

create index assessment_categories_course_id_idx
  on public.assessment_categories (course_id, sort_order);
create index assessment_categories_user_id_idx
  on public.assessment_categories (user_id);

create trigger assessment_categories_set_updated_at
  before update on public.assessment_categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- assessments
-- Individual graded items inside a category (CT 1 = 8/10, Midterm = 34/100...).
-- Attendance Method B (24/28) is stored by converting the ratio to
-- obtained/maximum at write time — no schema special-casing needed.
-- ---------------------------------------------------------------------------

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.assessment_categories (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  obtained_marks numeric(10, 2), -- null while pending / not yet graded
  maximum_marks numeric(10, 2) not null check (maximum_marks > 0),
  date date,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessments_obtained_within_maximum
    check (obtained_marks is null or (obtained_marks >= 0 and obtained_marks <= maximum_marks)),
  constraint assessments_completed_requires_marks
    check (status <> 'completed' or obtained_marks is not null)
);

create index assessments_category_id_idx on public.assessments (category_id);
create index assessments_user_id_idx on public.assessments (user_id);
create index assessments_date_idx on public.assessments (date);

create trigger assessments_set_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- targets
-- One active target per course (Pass, A-, custom percentage...).
-- ---------------------------------------------------------------------------

create table public.targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  label text not null check (char_length(trim(label)) between 1 and 40),
  percentage numeric(5, 2) not null check (percentage > 0 and percentage <= 100),
  grade_label text, -- optional letter attached to the target (e.g. "A-")
  kind text not null default 'custom' check (kind in ('preset', 'custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint targets_one_per_course unique (course_id)
);

create index targets_user_id_idx on public.targets (user_id);

create trigger targets_set_updated_at
  before update on public.targets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- academic_events
-- Assessment calendar entries (CT, Quiz, Midterm, Final, Custom...).
-- `type` is validated in the application layer so custom types stay possible.
-- ---------------------------------------------------------------------------

create table public.academic_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  event_date date not null,
  type text not null default 'other' check (char_length(trim(type)) between 1 and 40),
  notes text,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index academic_events_user_date_idx
  on public.academic_events (user_id, event_date);
create index academic_events_course_id_idx
  on public.academic_events (course_id);

create trigger academic_events_set_updated_at
  before update on public.academic_events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- A user can only ever touch rows carrying their own user_id.
-- ---------------------------------------------------------------------------

alter table public.semesters enable row level security;
alter table public.courses enable row level security;
alter table public.assessment_categories enable row level security;
alter table public.assessments enable row level security;
alter table public.targets enable row level security;
alter table public.academic_events enable row level security;

create policy "semesters_select_own" on public.semesters
  for select using (auth.uid() = user_id);
create policy "semesters_insert_own" on public.semesters
  for insert with check (auth.uid() = user_id);
create policy "semesters_update_own" on public.semesters
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "semesters_delete_own" on public.semesters
  for delete using (auth.uid() = user_id);

create policy "courses_select_own" on public.courses
  for select using (auth.uid() = user_id);
create policy "courses_insert_own" on public.courses
  for insert with check (auth.uid() = user_id);
create policy "courses_update_own" on public.courses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "courses_delete_own" on public.courses
  for delete using (auth.uid() = user_id);

create policy "assessment_categories_select_own" on public.assessment_categories
  for select using (auth.uid() = user_id);
create policy "assessment_categories_insert_own" on public.assessment_categories
  for insert with check (auth.uid() = user_id);
create policy "assessment_categories_update_own" on public.assessment_categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assessment_categories_delete_own" on public.assessment_categories
  for delete using (auth.uid() = user_id);

create policy "assessments_select_own" on public.assessments
  for select using (auth.uid() = user_id);
create policy "assessments_insert_own" on public.assessments
  for insert with check (auth.uid() = user_id);
create policy "assessments_update_own" on public.assessments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assessments_delete_own" on public.assessments
  for delete using (auth.uid() = user_id);

create policy "targets_select_own" on public.targets
  for select using (auth.uid() = user_id);
create policy "targets_insert_own" on public.targets
  for insert with check (auth.uid() = user_id);
create policy "targets_update_own" on public.targets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "targets_delete_own" on public.targets
  for delete using (auth.uid() = user_id);

create policy "academic_events_select_own" on public.academic_events
  for select using (auth.uid() = user_id);
create policy "academic_events_insert_own" on public.academic_events
  for insert with check (auth.uid() = user_id);
create policy "academic_events_update_own" on public.academic_events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "academic_events_delete_own" on public.academic_events
  for delete using (auth.uid() = user_id);


