-- cv 项目 schema（当前状态，无版本系统）

create table if not exists public.cv_resumes (
  username     text primary key,
  data         jsonb not null,
  updated_at   timestamptz not null default now()
);

create table if not exists public.cv_pat_tokens (
  id           uuid primary key default gen_random_uuid(),
  username     text not null,
  name         text not null,
  token_hash   text not null unique,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at   timestamptz
);

create index if not exists cv_pat_tokens_token_hash_idx on public.cv_pat_tokens (token_hash);
create index if not exists cv_pat_tokens_username_idx on public.cv_pat_tokens (username);

-- RLS
alter table public.cv_resumes    enable row level security;
alter table public.cv_pat_tokens enable row level security;

-- cv_resumes: 公开读，anon 可写（自助注册 + MCP 更新）
create policy "cv_resumes_public_read"   on public.cv_resumes for select using (true);
create policy "cv_resumes_anon_insert"   on public.cv_resumes for insert with check (true);
create policy "cv_resumes_anon_update"   on public.cv_resumes for update using (true) with check (true);

-- cv_pat_tokens: anon 可读（PAT 验证）、插入（注册）、更新（last_used_at）
create policy "cv_pat_tokens_anon_select" on public.cv_pat_tokens for select using (true);
create policy "cv_pat_tokens_anon_insert" on public.cv_pat_tokens for insert with check (true);
create policy "cv_pat_tokens_anon_update" on public.cv_pat_tokens for update using (true) with check (true);
