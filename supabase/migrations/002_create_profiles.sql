-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  org_type text check (org_type in ('기관', '기업', '개인')),
  discovery_source text,
  is_admin boolean default false,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- After setting this up, you must define the function 'handle_new_user' as shown below.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, org_type, discovery_source)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'org_type', 
    new.raw_user_meta_data->>'discovery_source'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
