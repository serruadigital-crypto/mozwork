-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- ─── TABELAS ──────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text not null,
  username text unique not null,
  avatar_url text,
  bio text,
  role text not null default 'client' check (role in ('client', 'professional', 'admin')),
  phone text,
  location text,
  skills text[] default '{}',
  hourly_rate numeric(10,2),
  is_verified boolean default false,
  rating numeric(3,2) default 0,
  total_reviews integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  icon text not null,
  description text,
  sort_order integer default 0
);

create table public.gigs (
  id uuid primary key default uuid_generate_v4(),
  professional_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category_id uuid references public.categories(id) not null,
  price numeric(10,2) not null check (price > 0),
  delivery_days integer not null check (delivery_days > 0),
  status text not null default 'active' check (status in ('active', 'paused', 'deleted')),
  cover_image text,
  images text[] default '{}',
  tags text[] default '{}',
  revisions integer default 1,
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  gig_id uuid references public.gigs(id) not null,
  client_id uuid references public.profiles(id) not null,
  professional_id uuid references public.profiles(id) not null,
  status text not null default 'pending' check (
    status in ('pending','in_progress','delivered','completed','cancelled','disputed')
  ),
  amount numeric(10,2) not null,
  platform_fee numeric(10,2) not null,
  professional_earnings numeric(10,2) not null,
  requirements text,
  delivery_deadline timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) not null unique,
  reviewer_id uuid references public.profiles(id) not null,
  reviewee_id uuid references public.profiles(id) not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz default now()
);

create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  participant_1 uuid references public.profiles(id) not null,
  participant_2 uuid references public.profiles(id) not null,
  created_at timestamptz default now()
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ─── DADOS INICIAIS ───────────────────────────────────────────────────────────

insert into public.categories (name, slug, icon, sort_order) values
  ('Design & Criativo', 'design', '🎨', 1),
  ('Programação & Tech', 'programacao', '💻', 2),
  ('Marketing Digital', 'marketing', '📱', 3),
  ('Redação & Tradução', 'redacao', '✍️', 4),
  ('Vídeo & Animação', 'video', '🎬', 5),
  ('Música & Áudio', 'musica', '🎵', 6),
  ('Fotografia', 'fotografia', '📸', 7),
  ('Consultoria & Negócios', 'consultoria', '💼', 8),
  ('Educação & Formação', 'educacao', '📚', 9),
  ('Arquitectura & Engenharia', 'arquitectura', '🏗️', 10);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.gigs enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
alter table public.conversations enable row level security;

-- Profiles
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id);

-- Gigs
create policy "gigs_select_active" on public.gigs for select using (
  status = 'active' or professional_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "gigs_insert_own" on public.gigs for insert with check (
  professional_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "gigs_update_own" on public.gigs for update using (
  professional_id = (select id from public.profiles where user_id = auth.uid())
);

-- Orders
create policy "orders_select_own" on public.orders for select using (
  client_id = (select id from public.profiles where user_id = auth.uid()) or
  professional_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "orders_insert_client" on public.orders for insert with check (
  client_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "orders_update_own" on public.orders for update using (
  client_id = (select id from public.profiles where user_id = auth.uid()) or
  professional_id = (select id from public.profiles where user_id = auth.uid())
);

-- Reviews
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (
  reviewer_id = (select id from public.profiles where user_id = auth.uid())
);

-- Categories (só leitura)
create policy "categories_select_all" on public.categories for select using (true);

-- ─── TRIGGERS ─────────────────────────────────────────────────────────────────

-- Criar perfil automaticamente ao registar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilizador'),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at automático
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger gigs_updated_at before update on public.gigs for each row execute procedure public.handle_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute procedure public.handle_updated_at();

-- Actualizar rating ao criar review
create or replace function public.update_professional_rating()
returns trigger as $$
begin
  update public.profiles set
    rating = (select round(avg(rating)::numeric, 2) from public.reviews where reviewee_id = new.reviewee_id),
    total_reviews = (select count(*) from public.reviews where reviewee_id = new.reviewee_id)
  where id = new.reviewee_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.update_professional_rating();
