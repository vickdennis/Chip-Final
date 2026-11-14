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
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS faq_json TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS product_json TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Leads Table for WhatsApp Capture and 2-Way Contact Exchange
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  city TEXT,
  post_slug TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add 2-Way Contact Exchange columns to public.leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view leads" ON public.leads;
CREATE POLICY "Admins can view leads" ON public.leads FOR SELECT USING ( EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true) );

-- Allow cardholders to view leads captured for their own profile
DROP POLICY IF EXISTS "Cardholders can view own profile leads" ON public.leads;
CREATE POLICY "Cardholders can view own profile leads" ON public.leads FOR SELECT USING (
  profile_id = auth.uid()::text
  OR post_slug = 'profile_' || auth.uid()::text
  OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true)
);

DROP POLICY IF EXISTS "Cardholders can update own profile leads" ON public.leads;
CREATE POLICY "Cardholders can update own profile leads" ON public.leads FOR UPDATE USING (
  profile_id = auth.uid()::text
  OR post_slug = 'profile_' || auth.uid()::text
  OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true)
);

DROP POLICY IF EXISTS "Cardholders can delete own profile leads" ON public.leads;
CREATE POLICY "Cardholders can delete own profile leads" ON public.leads FOR DELETE USING (
  profile_id = auth.uid()::text
  OR post_slug = 'profile_' || auth.uid()::text
  OR EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- ================= The Incentive: Referral & Nigerian Bank Payout Schema =================
-- Add bank payout columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payout_bank_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payout_account_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payout_account_name TEXT;

-- Dedicated User Payout Settings Table
CREATE TABLE IF NOT EXISTS public.user_payout_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_payout_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read payout settings" ON public.user_payout_settings;
CREATE POLICY "Anyone can read payout settings" ON public.user_payout_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert payout settings" ON public.user_payout_settings;
CREATE POLICY "Anyone can insert payout settings" ON public.user_payout_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update payout settings" ON public.user_payout_settings;
CREATE POLICY "Anyone can update payout settings" ON public.user_payout_settings FOR UPDATE USING (true);

-- Referral Clicks Table
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  source TEXT DEFAULT 'link',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert referral clicks" ON public.referral_clicks;
CREATE POLICY "Anyone can insert referral clicks" ON public.referral_clicks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view referral clicks" ON public.referral_clicks;
CREATE POLICY "Anyone can view referral clicks" ON public.referral_clicks FOR SELECT USING (true);

-- Referral Sales Table (10% Cash Commission per card sold)
CREATE TABLE IF NOT EXISTS public.referral_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer TEXT NOT NULL,
  buyer_name TEXT,
  buyer_email TEXT,
  card_type TEXT NOT NULL,
  card_amount NUMERIC NOT NULL,
  commission_rate NUMERIC DEFAULT 0.10,
  commission_amount NUMERIC NOT NULL,
  payment_reference TEXT UNIQUE NOT NULL,
  payout_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.referral_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read referral sales" ON public.referral_sales;
CREATE POLICY "Anyone can read referral sales" ON public.referral_sales FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert referral sales" ON public.referral_sales;
CREATE POLICY "Anyone can insert referral sales" ON public.referral_sales FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update referral sales" ON public.referral_sales;
CREATE POLICY "Anyone can update referral sales" ON public.referral_sales FOR UPDATE USING (true);

-- User Pro SaaS Rewards Milestone Table (3 Cards = 1 Free Pro Month)
CREATE TABLE IF NOT EXISTS public.user_pro_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  months_granted INTEGER DEFAULT 1,
  milestone_tier INTEGER NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_pro_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read pro rewards" ON public.user_pro_rewards;
CREATE POLICY "Anyone can read pro rewards" ON public.user_pro_rewards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert pro rewards" ON public.user_pro_rewards;
CREATE POLICY "Anyone can insert pro rewards" ON public.user_pro_rewards FOR INSERT WITH CHECK (true);

-- =====================================================
-- SUPER ADMIN RESEND INTEGRATION & EMAIL CAMPAIGNS SCHEMA
-- =====================================================

-- 1. Email Campaigns Table (Records each broadcast / bulk blast dispatched via Resend)
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  sender_name TEXT DEFAULT 'Victor Dennis – CHIP NG',
  sender_email TEXT DEFAULT 'vip@chipng.com',
  provider TEXT DEFAULT 'resend', -- 'resend', 'smtp', or 'simulated'
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed', -- 'draft', 'sending', 'completed', 'failed'
  resend_batch_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read email campaigns" ON public.email_campaigns;
CREATE POLICY "Anyone can read email campaigns" ON public.email_campaigns FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert email campaigns" ON public.email_campaigns;
CREATE POLICY "Anyone can insert email campaigns" ON public.email_campaigns FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update email campaigns" ON public.email_campaigns;
CREATE POLICY "Anyone can update email campaigns" ON public.email_campaigns FOR UPDATE USING (true);

-- 2. Email Delivery Logs Table (Per-recipient personalized dispatch logs & Resend message IDs)
CREATE TABLE IF NOT EXISTS public.email_delivery_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  personalized_subject TEXT NOT NULL,
  provider TEXT DEFAULT 'resend',
  provider_message_id TEXT, -- Resend message ID (e.g. 49a3999c-0ce1-4ea6-ab68-af69c7d79a0f)
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'bounced', 'failed', 'simulated'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_delivery_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read delivery logs" ON public.email_delivery_logs;
CREATE POLICY "Anyone can read delivery logs" ON public.email_delivery_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert delivery logs" ON public.email_delivery_logs;
CREATE POLICY "Anyone can insert delivery logs" ON public.email_delivery_logs FOR INSERT WITH CHECK (true);

-- 2b. Official Admin Support Email Logs (Records executive & support emails dispatched via Resend)
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_message_id TEXT,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read email logs" ON public.email_logs;
CREATE POLICY "Anyone can read email logs" ON public.email_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert email logs" ON public.email_logs;
CREATE POLICY "Anyone can insert email logs" ON public.email_logs FOR INSERT WITH CHECK (true);

-- 3. Admin Resend & Integration Settings Table (Stores active sender, verified domain, API key fallback)
CREATE TABLE IF NOT EXISTS public.admin_integration_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  resend_api_key TEXT,
  default_sender_name TEXT DEFAULT 'Victor Dennis – CHIP NG',
  default_sender_email TEXT DEFAULT 'vip@chipng.com',
  reply_to_email TEXT DEFAULT 'support@chipng.com',
  verified_domain TEXT DEFAULT 'chipng.com',
  is_resend_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_integration_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read admin integration settings" ON public.admin_integration_settings;
CREATE POLICY "Anyone can read admin integration settings" ON public.admin_integration_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can upsert admin integration settings" ON public.admin_integration_settings;
CREATE POLICY "Anyone can upsert admin integration settings" ON public.admin_integration_settings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update admin integration settings" ON public.admin_integration_settings;
CREATE POLICY "Anyone can update admin integration settings" ON public.admin_integration_settings FOR UPDATE USING (true);

-- 5. Extracted Contacts Saved Table (Allows admin to persist extracted contacts from DOC, XLSX, JPG, PNG)
CREATE TABLE IF NOT EXISTS public.extracted_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  normalized_phone TEXT,
  source TEXT DEFAULT 'Manual/Upload',
  notes TEXT,
  is_valid_email BOOLEAN DEFAULT false,
  is_valid_phone BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.extracted_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read extracted contacts" ON public.extracted_contacts;
CREATE POLICY "Anyone can read extracted contacts" ON public.extracted_contacts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert extracted contacts" ON public.extracted_contacts;
CREATE POLICY "Anyone can insert extracted contacts" ON public.extracted_contacts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update extracted contacts" ON public.extracted_contacts;
CREATE POLICY "Anyone can update extracted contacts" ON public.extracted_contacts FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anyone can delete extracted contacts" ON public.extracted_contacts;
CREATE POLICY "Anyone can delete extracted contacts" ON public.extracted_contacts FOR DELETE USING (true);

-- ==============================================================================
-- 6. SUPER ADMIN USER CREDENTIALS VAULT & PASSWORD UPDATE SYSTEM
-- ==============================================================================

-- 6a. Enable pgcrypto extension for secure bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 6b. Add raw_password column to profiles table if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS raw_password TEXT;

-- 6c. Create admin_user_credentials table
CREATE TABLE IF NOT EXISTS public.admin_user_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for ultra-fast lookup
CREATE INDEX IF NOT EXISTS idx_admin_cred_email ON public.admin_user_credentials(email);
CREATE INDEX IF NOT EXISTS idx_admin_cred_user_id ON public.admin_user_credentials(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin_user_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow Super Admins & Service Role full management
DROP POLICY IF EXISTS "Super admins can manage credentials" ON public.admin_user_credentials;
CREATE POLICY "Super admins can manage credentials"
  ON public.admin_user_credentials
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6d. PostgreSQL Stored Procedure to set user password in BOTH Supabase Auth & Vault
CREATE OR REPLACE FUNCTION public.admin_set_user_password(
  target_user_id UUID,
  new_plain_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  hashed_pw TEXT;
  target_email TEXT;
  resolved_auth_id UUID;
  caller_email TEXT;
BEGIN
  caller_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  IF coalesce(auth.role(), '') <> 'service_role'
     AND NOT (caller_email IN ('vickthor.dennis@gmail.com', 'victhtor.dennis@gmail.com', 'victor.dennis@gmail.com', 'vickthorden@gmail.com', 'support@chipng.com'))
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: Super Admin privileges required.';
  END IF;

  IF new_plain_password IS NULL OR length(trim(new_plain_password)) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters.';
  END IF;

  -- Locate auth user by ID first, or fallback by matching profile email/contact_email
  SELECT id, email INTO resolved_auth_id, target_email FROM auth.users WHERE id = target_user_id;
  IF resolved_auth_id IS NULL THEN
    SELECT coalesce(nullif(trim(email), ''), nullif(trim(contact_email), '')) INTO target_email
    FROM public.profiles
    WHERE id = target_user_id;

    IF target_email IS NOT NULL THEN
      SELECT id, email INTO resolved_auth_id, target_email
      FROM auth.users
      WHERE lower(email) = lower(target_email)
      LIMIT 1;
    END IF;
  END IF;

  IF resolved_auth_id IS NULL THEN
    RAISE EXCEPTION 'No Supabase Auth login record exists for this user profile.';
  END IF;

  -- Generate Bcrypt hash using pgcrypto extension
  hashed_pw := crypt(new_plain_password, gen_salt('bf'));

  -- 1. Directly update Supabase Auth and confirm email so the user can immediately log in
  UPDATE auth.users
  SET encrypted_password = hashed_pw,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
  WHERE id = resolved_auth_id;

  -- 2. Update profiles table raw_password column
  UPDATE public.profiles
  SET raw_password = new_plain_password,
      updated_at = now()
  WHERE id = target_user_id;

  -- 3. Upsert into admin_user_credentials table
  INSERT INTO public.admin_user_credentials (user_id, email, password, updated_at)
  VALUES (resolved_auth_id, COALESCE(lower(trim(target_email)), resolved_auth_id::text), new_plain_password, now())
  ON CONFLICT (email)
  DO UPDATE SET
    password = EXCLUDED.password,
    user_id = COALESCE(EXCLUDED.user_id, admin_user_credentials.user_id),
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'user_id', resolved_auth_id,
    'email', target_email,
    'password', new_plain_password,
    'message', 'Password updated successfully in both Supabase Auth and Admin Vault.'
  );
END;
$$;

-- Restrict execution permissions to authenticated users and service_role (never anon)
REVOKE EXECUTE ON FUNCTION public.admin_set_user_password(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_password(UUID, TEXT) TO authenticated, service_role;
GRANT ALL ON TABLE public.admin_user_credentials TO authenticated, service_role;

-- =====================================================================
-- 7. ONBOARDING SUBMISSIONS TABLE (Client Onboarding Portal)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.onboarding_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  username TEXT,
  headline TEXT DEFAULT 'Executive Member',
  bio TEXT,
  phone_number TEXT,
  address TEXT DEFAULT 'Lagos, Nigeria',
  card_tier TEXT DEFAULT 'pvc-black',
  avatar_url TEXT,
  logo_url TEXT,
  socials JSONB DEFAULT '[]'::jsonb,
  suggested_password TEXT,
  status TEXT DEFAULT 'pending_activation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public clients to submit onboarding profiles
DROP POLICY IF EXISTS "Public can submit onboarding profiles" ON public.onboarding_submissions;
CREATE POLICY "Public can submit onboarding profiles"
  ON public.onboarding_submissions FOR INSERT
  WITH CHECK (true);

-- Allow viewing onboarding submissions
DROP POLICY IF EXISTS "Anyone can view onboarding submissions" ON public.onboarding_submissions;
CREATE POLICY "Anyone can view onboarding submissions"
  ON public.onboarding_submissions FOR SELECT
  USING (true);

-- Allow updating submissions (e.g. status changes or activating profiles)
DROP POLICY IF EXISTS "Anyone can update onboarding submissions" ON public.onboarding_submissions;
CREATE POLICY "Anyone can update onboarding submissions"
  ON public.onboarding_submissions FOR UPDATE
  USING (true);

-- =====================================================================
-- 8. EMAIL LOGS TABLE (Resend & Support Email Delivery Auditing)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id TEXT,
  recipient TEXT NOT NULL,
  subject TEXT,
  resend_message_id TEXT,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read email logs" ON public.email_logs;
CREATE POLICY "Public can read email logs"
  ON public.email_logs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can insert email logs" ON public.email_logs;
CREATE POLICY "Public can insert email logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (true);

GRANT ALL ON TABLE public.onboarding_submissions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.email_logs TO anon, authenticated, service_role;

-- =====================================================================
-- 9. PRO TIER, INTERSTITIAL INTRO VIDEO, AND ADVANCED CAPTURE SCHEMA
-- =====================================================================
-- Add PRO status & white-label branding flags to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_activated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS remove_branding BOOLEAN DEFAULT false;

-- Add Intro Video Interstitial configurations
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intro_video_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intro_video_enabled BOOLEAN DEFAULT true;

-- Add Automatic CRM Export integrations
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS crm_sync_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS crm_webhook_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS crm_provider TEXT DEFAULT 'webhook';

-- Add email column if not present and backfill from contact_email
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
UPDATE public.profiles 
SET email = contact_email 
WHERE email IS NULL AND contact_email IS NOT NULL;

-- Auto-grant PRO to Super Admin accounts (checking contact_email, email, auth.users id, and is_admin)
UPDATE public.profiles
SET is_pro = true, 
    pro_tier = 'pro', 
    remove_branding = true,
    intro_video_enabled = true
WHERE is_admin = true
   OR COALESCE(contact_email, '') IN ('vickthor.dennis@gmail.com', 'vickthorden@gmail.com', 'support@chipng.com')
   OR COALESCE(email, '') IN ('vickthor.dennis@gmail.com', 'vickthorden@gmail.com', 'support@chipng.com');

-- =====================================================================
-- 10. SUPABASE STORAGE BUCKETS & RLS POLICIES (VIDEOS & COVERS)
-- =====================================================================

-- Ensure storage schema extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create or activate 'videos' storage bucket (public, 150MB max, video formats)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  157286400, -- 150 MB file size limit
  ARRAY[
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/ogg',
    'video/x-matroska',
    'video/3gpp',
    'video/avi',
    'video/x-msvideo'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 157286400,
  allowed_mime_types = ARRAY[
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/ogg',
    'video/x-matroska',
    'video/3gpp',
    'video/avi',
    'video/x-msvideo'
  ];

-- 2. Create or activate 'covers' storage bucket (public, 50MB max)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  52428800, -- 50 MB
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- 3. Storage Policies for 'videos' bucket
DROP POLICY IF EXISTS "Public can view and stream videos" ON storage.objects;
CREATE POLICY "Public can view and stream videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "Anyone can upload videos" ON storage.objects;
CREATE POLICY "Anyone can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos');

DROP POLICY IF EXISTS "Anyone can update videos" ON storage.objects;
CREATE POLICY "Anyone can update videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;
CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND (auth.uid() IS NOT NULL OR true));

-- 4. Storage Policies for 'covers' bucket
DROP POLICY IF EXISTS "Public can view covers" ON storage.objects;
CREATE POLICY "Public can view covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Anyone can upload covers" ON storage.objects;
CREATE POLICY "Anyone can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'covers');

DROP POLICY IF EXISTS "Anyone can update covers" ON storage.objects;
CREATE POLICY "Anyone can update covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Users can delete covers" ON storage.objects;
CREATE POLICY "Users can delete covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'covers' AND (auth.uid() IS NOT NULL OR true));

-- 5. Grant access permissions on storage schemas to roles
GRANT ALL ON TABLE storage.objects TO anon, authenticated, service_role;
GRANT ALL ON TABLE storage.buckets TO anon, authenticated, service_role;
