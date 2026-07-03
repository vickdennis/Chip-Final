-- Create a trigger function to update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enterprises Table
CREATE TABLE IF NOT EXISTS public.enterprises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_seats INTEGER DEFAULT 20,
  logo_url TEXT,
  brand_color TEXT DEFAULT '#000000',
  brand_font TEXT DEFAULT 'sans',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for enterprises
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enterprises are viewable by everyone." ON public.enterprises;
CREATE POLICY "Enterprises are viewable by everyone."
  ON public.enterprises FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Enterprise owners can insert." ON public.enterprises;
CREATE POLICY "Enterprise owners can insert."
  ON public.enterprises FOR INSERT
  WITH CHECK ( auth.uid() = owner_id );

DROP POLICY IF EXISTS "Enterprise owners can update." ON public.enterprises;
CREATE POLICY "Enterprise owners can update."
  ON public.enterprises FOR UPDATE
  USING ( auth.uid() = owner_id );

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
  enterprise_id UUID,
  is_enterprise_owner BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'default',
  bg_color TEXT,
  text_color TEXT,
  use_gradient BOOLEAN DEFAULT false,
  unlocked_themes TEXT[] DEFAULT '{}',
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

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'default';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bg_color TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS text_color TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS use_gradient BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unlocked_themes TEXT[] DEFAULT '{}';

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
  USING ( 
    auth.uid() = id 
    OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true)
    OR EXISTS (SELECT 1 FROM public.enterprises AS e WHERE e.id = enterprise_id AND e.owner_id = auth.uid())
  );

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add columns if they don't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
CREATE POLICY "Products are viewable by everyone."
  ON public.products FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can insert own products." ON public.products;
CREATE POLICY "Users can insert own products."
  ON public.products FOR INSERT
  WITH CHECK ( auth.uid() = profile_id OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Users can update own products." ON public.products;
CREATE POLICY "Users can update own products."
  ON public.products FOR UPDATE
  USING ( auth.uid() = profile_id OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Users can delete own products." ON public.products;
CREATE POLICY "Users can delete own products."
  ON public.products FOR DELETE
  USING ( auth.uid() = profile_id OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

-- Purchases Table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  net_earnings DECIMAL(10, 2) NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  purchase_type TEXT DEFAULT 'digital_product',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.purchases ALTER COLUMN seller_id DROP NOT NULL;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS purchase_type TEXT DEFAULT 'digital_product';

-- Enable RLS for purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Purchases Policies
DROP POLICY IF EXISTS "Users can view own sales." ON public.purchases;
CREATE POLICY "Users can view own sales."
  ON public.purchases FOR SELECT
  USING ( auth.uid() = seller_id OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Anyone can insert purchases (webhooks)." ON public.purchases;
CREATE POLICY "Anyone can insert purchases (webhooks)."
  ON public.purchases FOR INSERT
  WITH CHECK ( true );

DROP POLICY IF EXISTS "Anyone can update purchases (webhooks)." ON public.purchases;
CREATE POLICY "Anyone can update purchases (webhooks)."
  ON public.purchases FOR UPDATE
  USING ( true );

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
  WITH CHECK ( auth.uid() = profile_id OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Users can update own social links." ON public.social_links;
CREATE POLICY "Users can update own social links."
  ON public.social_links FOR UPDATE
  USING ( auth.uid() = profile_id OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Users can delete own social links." ON public.social_links;
CREATE POLICY "Users can delete own social links."
  ON public.social_links FOR DELETE
  USING ( auth.uid() = profile_id OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

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

-- Profile Views Table for Analytics
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert views" ON public.profile_views;
CREATE POLICY "Anyone can insert views"
  ON public.profile_views FOR INSERT
  WITH CHECK ( true );

DROP POLICY IF EXISTS "Users can read own profile views" ON public.profile_views;
CREATE POLICY "Users can read own profile views"
  ON public.profile_views FOR SELECT
  USING ( auth.uid() = profile_id OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) OR EXISTS (SELECT 1 FROM public.enterprises AS e JOIN public.profiles AS ep ON e.id = ep.enterprise_id WHERE e.owner_id = auth.uid() AND ep.id = public.profile_views.profile_id) );

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS keywords TEXT[];
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Trigger to auto-update 'updated_at' on posts
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Blog Posts Policies
DROP POLICY IF EXISTS "Public posts are viewable by everyone." ON public.posts;
CREATE POLICY "Public posts are viewable by everyone."
  ON public.posts FOR SELECT
  USING ( is_published = true OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Admins can insert posts." ON public.posts;
CREATE POLICY "Admins can insert posts."
  ON public.posts FOR INSERT
  WITH CHECK ( EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Admins can update posts." ON public.posts;
CREATE POLICY "Admins can update posts."
  ON public.posts FOR UPDATE
  USING ( EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Admins can delete posts." ON public.posts;
CREATE POLICY "Admins can delete posts."
  ON public.posts FOR DELETE
  USING ( EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );



-- Blog Views Table for Analytics
CREATE TABLE IF NOT EXISTS public.blog_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert blog views" ON public.blog_views;
CREATE POLICY "Anyone can insert blog views"
  ON public.blog_views FOR INSERT
  WITH CHECK ( true );

DROP POLICY IF EXISTS "Admins can read blog views" ON public.blog_views;
CREATE POLICY "Admins can read blog views"
  ON public.blog_views FOR SELECT
  USING ( EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

-- Storage setup for Blog Covers
INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Storage blog is publicly accessible." ON storage.objects;
CREATE POLICY "Storage blog is publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'blog' );

DROP POLICY IF EXISTS "Admins can upload to blog." ON storage.objects;
CREATE POLICY "Admins can upload to blog."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'blog' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Admins can update blog." ON storage.objects;
CREATE POLICY "Admins can update blog."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'blog' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

DROP POLICY IF EXISTS "Admins can delete from blog." ON storage.objects;
CREATE POLICY "Admins can delete from blog."
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'blog' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );


ALTER TABLE public.links ADD COLUMN IF NOT EXISTS size TEXT DEFAULT 'Button';
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS use_link_icon BOOLEAN DEFAULT true;
