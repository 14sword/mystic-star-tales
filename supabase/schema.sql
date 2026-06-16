-- Mystic Star Tales Supabase schema.
-- Run in the Supabase SQL editor after creating the project.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    display_name text,
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.stories (
    id text primary key,
    title text not null,
    origin text,
    preview text,
    story_html text,
    icon text,
    version integer not null default 1,
    published boolean not null default true,
    updated_at timestamptz not null default now()
);

create table if not exists public.story_assets (
    id uuid primary key default uuid_generate_v4(),
    story_id text not null references public.stories(id) on delete cascade,
    asset_type text not null,
    storage_path text not null,
    prompt text,
    model text default 'gpt-image-2',
    offline_ready boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists public.user_story_state (
    user_id uuid not null references auth.users(id) on delete cascade,
    story_id text not null,
    favorite boolean not null default false,
    bookmarked boolean not null default false,
    read boolean not null default false,
    read_progress numeric not null default 0,
    rating integer check (rating between 1 and 5),
    comment text,
    updated_at timestamptz not null default now(),
    primary key (user_id, story_id)
);

create table if not exists public.notes (
    user_id uuid not null references auth.users(id) on delete cascade,
    story_id text not null,
    body text not null default '',
    updated_at timestamptz not null default now(),
    primary key (user_id, story_id)
);

create table if not exists public.achievements (
    user_id uuid not null references auth.users(id) on delete cascade,
    achievement_id text not null,
    unlocked boolean not null default false,
    progress numeric not null default 0,
    updated_at timestamptz not null default now(),
    primary key (user_id, achievement_id)
);

create table if not exists public.sync_events (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    source text not null default 'web',
    payload jsonb not null,
    created_at timestamptz not null default now()
);

create table if not exists public.ai_generation_jobs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete set null,
    story_id text,
    prompt text not null,
    style text not null default 'mythic-editorial',
    media_type text not null default 'image',
    model text not null default 'gpt-image-2',
    status text not null default 'queued',
    provider_job_id text,
    storage_path text,
    video_url text,
    error text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.ai_generation_jobs
    add column if not exists media_type text not null default 'image',
    add column if not exists provider_job_id text,
    add column if not exists video_url text;

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.story_assets enable row level security;
alter table public.user_story_state enable row level security;
alter table public.notes enable row level security;
alter table public.achievements enable row level security;
alter table public.sync_events enable row level security;
alter table public.ai_generation_jobs enable row level security;

create policy "public stories are readable" on public.stories
    for select using (published = true);

create policy "public story assets are readable" on public.story_assets
    for select using (true);

create policy "users read own profile" on public.profiles
    for select using (auth.uid() = id);

create policy "users update own profile" on public.profiles
    for update using (auth.uid() = id);

create policy "users read own story state" on public.user_story_state
    for select using (auth.uid() = user_id);

create policy "users upsert own story state" on public.user_story_state
    for insert with check (auth.uid() = user_id);

create policy "users update own story state" on public.user_story_state
    for update using (auth.uid() = user_id);

create policy "users read own notes" on public.notes
    for select using (auth.uid() = user_id);

create policy "users insert own notes" on public.notes
    for insert with check (auth.uid() = user_id);

create policy "users update own notes" on public.notes
    for update using (auth.uid() = user_id);

create policy "users delete own notes" on public.notes
    for delete using (auth.uid() = user_id);

create policy "users read own achievements" on public.achievements
    for select using (auth.uid() = user_id);

create policy "users insert own achievements" on public.achievements
    for insert with check (auth.uid() = user_id);

create policy "users update own achievements" on public.achievements
    for update using (auth.uid() = user_id);

create policy "users read own sync events" on public.sync_events
    for select using (auth.uid() = user_id);

create policy "users create own sync events" on public.sync_events
    for insert with check (auth.uid() = user_id);

create policy "users read own ai jobs" on public.ai_generation_jobs
    for select using (auth.uid() = user_id);

create policy "users create own ai jobs" on public.ai_generation_jobs
    for insert with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, display_name)
    values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
