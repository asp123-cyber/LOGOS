-- LOGOS starter schema. Review and test policies in a Supabase development project
-- before using with real users. Admin assignment must be performed by a trusted operator.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]{3,24}$')
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content jsonb not null default '{}'::jsonb,
  cover_image_url text,
  category text not null default 'Ideas',
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published','archived','hidden')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create table if not exists public.article_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  status text not null default 'visible' check (status in ('visible','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('article','comment','profile')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 5 and 2000),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists articles_author_idx on public.articles(author_id);
create index if not exists articles_public_feed_idx on public.articles(status, published_at desc);
create index if not exists comments_article_idx on public.comments(article_id, created_at);
create index if not exists follows_following_idx on public.follows(following_id);
create index if not exists reports_status_idx on public.reports(status, created_at);

-- Updated timestamp helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at before update on public.articles
for each row execute function public.set_updated_at();

drop trigger if exists comments_updated_at on public.comments;
create trigger comments_updated_at before update on public.comments
for each row execute function public.set_updated_at();

-- Create a profile on signup. Username is generated as a temporary unique value;
-- users should complete their public username in onboarding.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_name text;
begin
  base_name := 'writer_' || substr(replace(new.id::text, '-', ''), 1, 10);
  insert into public.profiles (id, username, display_name)
  values (new.id, base_name, coalesce(new.raw_user_meta_data ->> 'display_name', 'New writer'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Admin helper. Role is stored in profiles; only trusted operators may set it.
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.follows enable row level security;
alter table public.article_likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;

-- Profiles: public fields are readable; users may update their own editable fields.
drop policy if exists "Public profiles readable" on public.profiles;
create policy "Public profiles readable" on public.profiles
for select using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (
  id = (select auth.uid())
  and role = (select role from public.profiles where id = (select auth.uid()))
);

-- Articles: published visible to all; author and admin can read drafts/hidden items.
drop policy if exists "Read published or own/admin articles" on public.articles;
create policy "Read published or own/admin articles" on public.articles
for select using (
  (status = 'published') or author_id = (select auth.uid()) or public.is_admin()
);

drop policy if exists "Authors create own articles" on public.articles;
create policy "Authors create own articles" on public.articles
for insert to authenticated
with check (author_id = (select auth.uid()) and status in ('draft','published'));

drop policy if exists "Authors or admins update articles" on public.articles;
create policy "Authors or admins update articles" on public.articles
for update to authenticated
using (author_id = (select auth.uid()) or public.is_admin())
with check (author_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Authors or admins delete articles" on public.articles;
create policy "Authors or admins delete articles" on public.articles
for delete to authenticated
using (author_id = (select auth.uid()) or public.is_admin());

-- Follows
drop policy if exists "Follows publicly readable" on public.follows;
create policy "Follows publicly readable" on public.follows
for select using (true);

drop policy if exists "Users create own follows" on public.follows;
create policy "Users create own follows" on public.follows
for insert to authenticated
with check (follower_id = (select auth.uid()) and follower_id <> following_id);

drop policy if exists "Users delete own follows" on public.follows;
create policy "Users delete own follows" on public.follows
for delete to authenticated
using (follower_id = (select auth.uid()));

-- Likes
drop policy if exists "Likes publicly readable" on public.article_likes;
create policy "Likes publicly readable" on public.article_likes
for select using (true);

drop policy if exists "Users like as themselves" on public.article_likes;
create policy "Users like as themselves" on public.article_likes
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.articles a where a.id = article_id and a.status = 'published')
);

drop policy if exists "Users remove own likes" on public.article_likes;
create policy "Users remove own likes" on public.article_likes
for delete to authenticated
using (user_id = (select auth.uid()));

-- Bookmarks: private
drop policy if exists "Users read own bookmarks" on public.bookmarks;
create policy "Users read own bookmarks" on public.bookmarks
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Users create own bookmarks" on public.bookmarks;
create policy "Users create own bookmarks" on public.bookmarks
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.articles a where a.id = article_id and a.status = 'published')
);

drop policy if exists "Users delete own bookmarks" on public.bookmarks;
create policy "Users delete own bookmarks" on public.bookmarks
for delete to authenticated using (user_id = (select auth.uid()));

-- Comments: public can read visible comments on published articles.
drop policy if exists "Read visible comments on published articles" on public.comments;
create policy "Read visible comments on published articles" on public.comments
for select using (
  status = 'visible'
  and exists (select 1 from public.articles a where a.id = article_id and a.status = 'published')
  or author_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists "Authenticated users comment" on public.comments;
create policy "Authenticated users comment" on public.comments
for insert to authenticated
with check (
  author_id = (select auth.uid())
  and status = 'visible'
  and exists (select 1 from public.articles a where a.id = article_id and a.status = 'published')
);

drop policy if exists "Authors edit own comments" on public.comments;
create policy "Authors edit own comments" on public.comments
for update to authenticated
using (author_id = (select auth.uid()) or public.is_admin())
with check (author_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Authors or admins delete comments" on public.comments;
create policy "Authors or admins delete comments" on public.comments
for delete to authenticated
using (author_id = (select auth.uid()) or public.is_admin());

-- Reports: only reporter and admins can read; authenticated users can report.
drop policy if exists "Reporter or admin reads reports" on public.reports;
create policy "Reporter or admin reads reports" on public.reports
for select to authenticated
using (reporter_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Users submit reports" on public.reports;
create policy "Users submit reports" on public.reports
for insert to authenticated
with check (reporter_id = (select auth.uid()) and status = 'open');

drop policy if exists "Admins manage reports" on public.reports;
create policy "Admins manage reports" on public.reports
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---- INVITES TABLE ----
-- Used for invite-only registration. Admin creates invites; new users
-- present a token during signup that is validated server-side.

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  email text,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index if not exists invites_token_idx on public.invites(token);

alter table public.invites enable row level security;

-- Only admins can read and create invites
drop policy if exists "Admins read invites" on public.invites;
create policy "Admins read invites" on public.invites
for select to authenticated
using (public.is_admin());

drop policy if exists "Admins create invites" on public.invites;
create policy "Admins create invites" on public.invites
for insert to authenticated
with check (public.is_admin() and invited_by = (select auth.uid()));

drop policy if exists "Admins update invites" on public.invites;
create policy "Admins update invites" on public.invites
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---- STORAGE BUCKETS (run in SQL editor or configure via dashboard) ----
-- These statements require storage schema access. If they fail in the SQL
-- editor, create the buckets manually in the Supabase dashboard Storage page.
--
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
--   on conflict (id) do nothing;
-- insert into storage.buckets (id, name, public) values ('article-images', 'article-images', true)
--   on conflict (id) do nothing;
--
-- Storage policies (apply via dashboard → Storage → Policies):
--   avatars bucket:
--     SELECT: public (allow all)
--     INSERT: authenticated, path starts with user's own UUID
--     UPDATE: authenticated, path starts with user's own UUID
--     DELETE: authenticated, path starts with user's own UUID
--
--   article-images bucket:
--     SELECT: public (allow all)
--     INSERT: authenticated
--     UPDATE: authenticated, owner matches
--     DELETE: authenticated, owner matches or admin

-- ---- HELPFUL VIEWS ----

-- Article counts view for efficient feed queries
create or replace view public.article_stats as
select
  a.id as article_id,
  count(distinct al.user_id) as like_count,
  count(distinct c.id) as comment_count
from public.articles a
left join public.article_likes al on al.article_id = a.id
left join public.comments c on c.article_id = a.id and c.status = 'visible'
group by a.id;

-- IMPORTANT SECURITY REVIEW BEFORE LAUNCH:
-- 1) This starter schema is not a complete invite-only registration system.
--    Implement invite validation with a trusted Supabase Edge Function or equivalent.
-- 2) The profile role update policy above is defense-in-depth, but verify it carefully
--    in your actual Supabase project and add column-level restrictions / trusted RPC
--    as appropriate. Never let a user modify role.
-- 3) Consider making public profile SELECT use a safe view if you later add private columns.
-- 4) Review comments update policy so authors cannot change moderation status.
-- 5) Validate article JSON content and upload rules in the application/backend.
-- 6) Test every policy as anon, authenticated member, author and admin before launch.
