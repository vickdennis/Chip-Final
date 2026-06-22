-- Create a trigger function to update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  username TEXT UNIQUE,
  headline TEXT,
  bio TEXT,
  cover_image_url TEXT,
  contact_email TEXT,
  phone_number TEXT,
  address TEXT,
  booking_provider TEXT DEFAULT 'Calendly (Integrated)',
  calendar_link TEXT,
  show_availability BOOLEAN DEFAULT true,
  show_total_followers BOOLEAN DEFAULT false,
  social_links_style TEXT DEFAULT 'inline',
  is_verified BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to auto-update 'updated_at' on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
CREATE POLICY "Products are viewable by everyone."
  ON public.products FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Admins can insert products." ON public.products;
CREATE POLICY "Admins can insert products."
  ON public.products FOR INSERT
  WITH CHECK ( EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Admins can update products." ON public.products;
CREATE POLICY "Admins can update products."
  ON public.products FOR UPDATE
  USING ( EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Admins can delete products." ON public.products;
CREATE POLICY "Admins can delete products."
  ON public.products FOR DELETE
  USING ( EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

-- Links Table
CREATE TABLE IF NOT EXISTS public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for links
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Links Policies
DROP POLICY IF EXISTS "Links are viewable by everyone." ON public.links;
CREATE POLICY "Links are viewable by everyone."
  ON public.links FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can insert own links." ON public.links;
CREATE POLICY "Users can insert own links."
  ON public.links FOR INSERT
  WITH CHECK ( auth.uid() = profile_id );

DROP POLICY IF EXISTS "Users can update own links." ON public.links;
CREATE POLICY "Users can update own links."
  ON public.links FOR UPDATE
  USING ( auth.uid() = profile_id );

DROP POLICY IF EXISTS "Users can delete own links." ON public.links;
CREATE POLICY "Users can delete own links."
  ON public.links FOR DELETE
  USING ( auth.uid() = profile_id );

-- Social Links Table
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for social_links
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Social Links Policies
DROP POLICY IF EXISTS "Social links are viewable by everyone." ON public.social_links;
CREATE POLICY "Social links are viewable by everyone."
  ON public.social_links FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can insert own social links." ON public.social_links;
CREATE POLICY "Users can insert own social links."
  ON public.social_links FOR INSERT
  WITH CHECK ( auth.uid() = profile_id );

DROP POLICY IF EXISTS "Users can update own social links." ON public.social_links;
CREATE POLICY "Users can update own social links."
  ON public.social_links FOR UPDATE
  USING ( auth.uid() = profile_id );

DROP POLICY IF EXISTS "Users can delete own social links." ON public.social_links;
CREATE POLICY "Users can delete own social links."
  ON public.social_links FOR DELETE
  USING ( auth.uid() = profile_id );

-- Function to automatically create a profile after inserting a user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 1;
BEGIN
  base_username := split_part(new.email, '@', 1);
  final_username := base_username;

  -- Ensure unique username
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || counter::text;
    counter := counter + 1;
  END LOOP;

  INSERT INTO public.profiles (id, full_name, username, headline)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', final_username, 'Tech Professional');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Storage setup for Profile Covers
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Storage is publicly accessible." ON storage.objects;
CREATE POLICY "Storage is publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id IN ('covers', 'products', 'avatars') );

DROP POLICY IF EXISTS "Authenticated users can upload." ON storage.objects;
CREATE POLICY "Authenticated users can upload."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id IN ('covers', 'products', 'avatars') AND auth.uid() IS NOT NULL );

DROP POLICY IF EXISTS "Authenticated users can update." ON storage.objects;
CREATE POLICY "Authenticated users can update."
  ON storage.objects FOR UPDATE
  USING ( bucket_id IN ('covers', 'products', 'avatars') AND auth.uid() IS NOT NULL );

DROP POLICY IF EXISTS "Authenticated users can delete." ON storage.objects;
CREATE POLICY "Authenticated users can delete."
  ON storage.objects FOR DELETE
  USING ( bucket_id IN ('covers', 'products', 'avatars') AND auth.uid() IS NOT NULL );

-- Platform Social Links Table
CREATE TABLE IF NOT EXISTS public.platform_social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for platform_social_links
ALTER TABLE public.platform_social_links ENABLE ROW LEVEL SECURITY;

-- Platform Social Links Policies
DROP POLICY IF EXISTS "Platform social links are viewable by everyone." ON public.platform_social_links;
CREATE POLICY "Platform social links are viewable by everyone."
  ON public.platform_social_links FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Admins can insert platform social links." ON public.platform_social_links;
CREATE POLICY "Admins can insert platform social links."
  ON public.platform_social_links FOR INSERT
  WITH CHECK ( EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Admins can update platform social links." ON public.platform_social_links;
CREATE POLICY "Admins can update platform social links."
  ON public.platform_social_links FOR UPDATE
  USING ( EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Admins can delete platform social links." ON public.platform_social_links;
CREATE POLICY "Admins can delete platform social links."
  ON public.platform_social_links FOR DELETE
  USING ( EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

