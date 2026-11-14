import { useState, useEffect } from 'react';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import UserDashboard from './views/UserDashboard';
import PublicProfileView from './views/PublicProfileView';
import AdminDashboard from './views/AdminDashboard';
import EnterpriseDashboard from './views/EnterpriseDashboard';
import BlogDirectoryView from './views/BlogDirectoryView';
import BlogArticleView from './views/BlogArticleView';
import NfcSalesView from './views/NfcSalesView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import TermsOfServiceView from './views/TermsOfServiceView';
import ShippingPolicyView from './views/ShippingPolicyView';
import RefundPolicyView from './views/RefundPolicyView';
import CommercialLandingView from './views/CommercialLandingView';
import { MakroCompanyView } from './views/MakroCompanyView';
import { MakroUpdatesView } from './views/MakroUpdatesView';
import { MakroContactView } from './views/MakroContactView';
import { PortfolioView } from './views/PortfolioView';
import CorporateBundleView from './views/CorporateBundleView';
import ClientOnboardingView from './views/ClientOnboardingView';
import { COMMERCIAL_PAGES } from './data/commercialPagesData';
import { supabase } from './supabaseClient';
import { ToastContainer } from './components/Toast';
import { extractUsernameFromPath } from './utils/usernameHelper';
import { CurrencyProvider } from './context/CurrencyContext';

export type ViewState = 
  | 'landing' 
  | 'company' 
  | 'updates' 
  | 'contact' 
  | 'login' 
  | 'user-dashboard' 
  | 'public-profile' 
  | 'admin-dashboard' 
  | 'enterprise-dashboard' 
  | 'blog-directory' 
  | 'blog-article' 
  | 'nfc-sales' 
  | 'corporate-bundle'
  | 'privacy-policy' 
  | 'terms-of-service'
  | 'shipping'
  | 'refund-policy'
  | 'commercial-landing'
  | 'portfolio'
  | 'onboarding';

const RESERVED_CORE_ROUTES = new Set([
  '',
  '/',
  'admin',
  'enterprise',
  'login',
  'dashboard',
  'blog',
  'app',
  'download',
  'get-app',
  'mobile',
  'android',
  'review',
  'reviews',
  'drop-review',
  'company',
  'about',
  'updates',
  'contact',
  'buy-card',
  'buycard',
  'shop',
  'pricing',
  'faq',
  'privacy',
  'privacy-policy',
  'terms',
  'terms-of-service',
  'refund-policy',
  'shipping',
  'api',
  'portfolio',
  'corporate-bundle',
  'corporate-fleet',
  'fleet',
  'corporate',
  'onboarding',
  'client-onboarding',
  'setup-profile',
  'setup'
]);

function resolveRouteFromUrl(rawPath: string): {
  view: ViewState;
  publicUsername: string | null;
  blogSlug: string | null;
  commercialSlug: string | null;
} {
  const path = (rawPath || '/').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const cleanSegment = path.replace(/^\//, '');
  const firstSegment = cleanSegment.split('/')[0].toLowerCase();

  if (COMMERCIAL_PAGES[cleanSegment]) {
    return { view: 'commercial-landing', publicUsername: null, blogSlug: null, commercialSlug: cleanSegment };
  }
  if (['onboarding', 'client-onboarding', 'setup-profile', 'setup'].includes(cleanSegment)) {
    return { view: 'onboarding', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/admin' || path.startsWith('/admin/')) {
    return { view: 'admin-dashboard', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/enterprise' || path.startsWith('/enterprise/')) {
    return { view: 'enterprise-dashboard', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/login' || path.startsWith('/login/')) {
    return { view: 'login', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/dashboard' || path.startsWith('/dashboard/')) {
    return { view: 'user-dashboard', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (['corporate-bundle', 'corporate-fleet', 'fleet', 'corporate'].includes(cleanSegment)) {
    return { view: 'corporate-bundle', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/review' || path === '/reviews' || path === '/drop-review') {
    if (typeof window !== 'undefined') {
      window.location.href = 'https://g.page/r/CZGM0zQdEiY7EAE/review';
    }
    return { view: 'landing', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (['app', 'download', 'mobile', 'get-app', 'android'].includes(firstSegment)) {
    return { view: 'landing', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (firstSegment === 'blog') {
    if (path.startsWith('/blog/')) {
      const slug = path.replace(/^\/blog\//, '').replace(/\/+$/, '');
      if (slug) {
        return { view: 'blog-article', publicUsername: null, blogSlug: slug, commercialSlug: null };
      }
    }
    return { view: 'blog-directory', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/company' || path === '/about') {
    return { view: 'company', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/updates') {
    return { view: 'updates', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/contact') {
    return { view: 'contact', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/buy-card' || path === '/buycard') {
    return { view: 'nfc-sales', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/shop') {
    return { view: 'landing', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/privacy-policy' || path === '/privacy') {
    return { view: 'privacy-policy', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/terms-of-service' || path === '/terms') {
    return { view: 'terms-of-service', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/shipping') {
    return { view: 'shipping', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/refund-policy') {
    return { view: 'refund-policy', publicUsername: null, blogSlug: null, commercialSlug: null };
  }
  if (path === '/portfolio') {
    return { view: 'portfolio', publicUsername: null, blogSlug: null, commercialSlug: null };
  }

  // If path is not root and firstSegment is not a reserved route, treat as public profile
  if (path !== '/' && !RESERVED_CORE_ROUTES.has(firstSegment)) {
    const extractedUser = extractUsernameFromPath(path);
    if (extractedUser) {
      return { view: 'public-profile', publicUsername: extractedUser, blogSlug: null, commercialSlug: null };
    }
  }

  return { view: 'landing', publicUsername: null, blogSlug: null, commercialSlug: null };
}

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    // Restricted or private browser storage
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    // Restricted or private browser storage
  }
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return safeGetItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      safeSetItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      safeSetItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Global Referral & Affiliate Attribution Capture
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref') || urlParams.get('aff') || urlParams.get('referrer') || urlParams.get('referral');
        if (ref && typeof ref === 'string') {
          const cleanRef = ref.trim().replace(/^@/, '').toLowerCase();
          if (cleanRef && cleanRef.length >= 2 && !['undefined', 'null'].includes(cleanRef)) {
            safeSetItem('chipng_referrer', cleanRef);
            document.cookie = `chipng_referrer=${encodeURIComponent(cleanRef)}; max-age=${60 * 60 * 24 * 30}; path=/; SameSite=Lax`;
            fetch('/api/referrals/record-click', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ referrer: cleanRef, source: urlParams.get('source') || 'link' })
            }).catch(() => {});
          }
        }
      }
    } catch (e) {}
  }, []);

  const initialRoute = resolveRouteFromUrl(typeof window !== 'undefined' ? window.location.pathname : '/');
  const [commercialSlug, setCommercialSlug] = useState<string | null>(initialRoute.commercialSlug);
  const [currentView, setCurrentView] = useState<ViewState>(initialRoute.view);
  const [publicUsername, setPublicUsername] = useState<string | null>(initialRoute.publicUsername);
  const [blogSlug, setBlogSlug] = useState<string | null>(initialRoute.blogSlug);

  const [autoDownloadVCard, setAutoDownloadVCard] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const p = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    return p.endsWith('/vcard') || p.endsWith('.vcf');
  });

  const [initialOAuthState] = useState(() => {
    if (typeof window === 'undefined') {
      return { hasCodeOrToken: false, oauthError: null as string | null };
    }
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const rawHash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
      const hashParams = new URLSearchParams(rawHash);
      const oauthError =
        searchParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error_description') ||
        hashParams.get('error');
      const hasCodeOrToken = Boolean(
        searchParams.get('code') ||
        hashParams.get('access_token') ||
        hashParams.get('refresh_token')
      );
      if (oauthError) {
        try {
          window.sessionStorage.setItem('chipng_oauth_error', decodeURIComponent(oauthError.replace(/\+/g, ' ')));
        } catch (_e) {}
      }
      return { hasCodeOrToken, oauthError };
    } catch (_e) {
      return { hasCodeOrToken: false, oauthError: null as string | null };
    }
  });

  const [sessionLoading, setSessionLoading] = useState(true);
  const [oauthExchanging, setOauthExchanging] = useState(initialOAuthState.hasCodeOrToken);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Sync Google/OAuth user profile into public.profiles without invalid schema columns
    const syncAuthUserProfile = async (user: any) => {
      if (!user?.id) return;
      try {
        const cleanEmail = (user.email || '').toLowerCase().trim();
        const userMeta = user.user_metadata || {};
        const metaName = (userMeta.full_name || userMeta.name || '').trim();
        const metaAvatar = (userMeta.avatar_url || userMeta.picture || '').trim() || null;

        const { data: existing } = await supabase
          .from('profiles')
          .select('id, full_name, username, email, contact_email, cover_image_url')
          .eq('id', user.id)
          .maybeSingle();

        if (existing) {
          const updates: Record<string, any> = {};
          if (!existing.email && cleanEmail) updates.email = cleanEmail;
          if (!existing.contact_email && cleanEmail) updates.contact_email = cleanEmail;
          if (!existing.full_name && metaName) updates.full_name = metaName;
          if (!existing.cover_image_url && metaAvatar) updates.cover_image_url = metaAvatar;
          if (Object.keys(updates).length > 0) {
            await supabase.from('profiles').update(updates).eq('id', user.id);
          }
        } else {
          const baseUsername = (cleanEmail.split('@')[0] || 'user')
            .replace(/[^a-z0-9_.-]/g, '')
            .toLowerCase() || `user${Math.floor(Math.random() * 10000)}`;
          const newProfilePayload: Record<string, any> = {
            id: user.id,
            full_name: metaName || baseUsername,
            username: baseUsername,
            headline: 'Executive Member',
            email: cleanEmail || null,
            contact_email: cleanEmail || null,
            cover_image_url: metaAvatar || 'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.8384244203439832.jpeg',
            is_verified: true,
            theme: 'default'
          };
          const { error: upsertErr } = await supabase.from('profiles').upsert(newProfilePayload, { onConflict: 'id' });
          if (upsertErr && upsertErr.code === '23505') {
            newProfilePayload.username = `${baseUsername}${Math.floor(100 + Math.random() * 9000)}`;
            await supabase.from('profiles').upsert(newProfilePayload, { onConflict: 'id' });
          }
        }
      } catch (_syncErr) {
        // Non-blocking profile sync fallback handled inside UserDashboard
      }
    };

    // Smooth scroll if landing on /shop
    if (typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/shop') {
      setTimeout(() => {
        const el = document.getElementById('shop');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }

    // If OAuth redirected back with an error, route immediately to /login with error preserved
    if (initialOAuthState.oauthError) {
      setOauthExchanging(false);
      setSessionLoading(false);
      window.history.replaceState({}, '', '/login');
      setCurrentView('login');
    }

    // Browser back/forward navigation sync
    const handlePopState = () => {
      const route = resolveRouteFromUrl(window.location.pathname);
      setCurrentView(route.view);
      setPublicUsername(route.publicUsername);
      setBlogSlug(route.blogSlug);
      setCommercialSlug(route.commercialSlug);
      const p = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      setAutoDownloadVCard(p.endsWith('/vcard') || p.endsWith('.vcf'));
    };
    window.addEventListener('popstate', handlePopState);

    let oauthSettled = !initialOAuthState.hasCodeOrToken;

    // Safety timeout: give OAuth PKCE code exchange enough time on slower mobile connections before unblocking
    const timeoutId = setTimeout(() => {
      oauthSettled = true;
      setOauthExchanging(false);
      setSessionLoading(false);
    }, initialOAuthState.hasCodeOrToken ? 6000 : 2000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeoutId);
        oauthSettled = true;
        setSession(session);
        setSessionLoading(false);
        setOauthExchanging(false);

        if (session?.user) {
          syncAuthUserProfile(session.user);
        }

        // Protect dashboard routes if session is absent or route completed OAuth/login cleanly to /dashboard
        setCurrentView(prev => {
          const isProtected = prev === 'user-dashboard' || prev === 'admin-dashboard' || prev === 'enterprise-dashboard';
          if (!session && isProtected) {
            window.history.replaceState({}, '', '/login');
            return 'login';
          } else if (session && (prev === 'login' || initialOAuthState.hasCodeOrToken)) {
            window.history.replaceState({}, '', '/dashboard');
            return 'user-dashboard';
          }
          return prev;
        });
      })
      .catch((err) => {
        console.warn('Session check encountered error or timeout, proceeding:', err);
        clearTimeout(timeoutId);
        oauthSettled = true;
        setOauthExchanging(false);
        setSessionLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        syncAuthUserProfile(session.user);
      }
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
        oauthSettled = true;
        setOauthExchanging(false);
        setSessionLoading(false);
      }

      // Use functional state update to avoid dependency on currentView
      setCurrentView((prevView) => {
        const isProtected = prevView === 'user-dashboard' || prevView === 'admin-dashboard' || prevView === 'enterprise-dashboard';
        if (!session && isProtected) {
          if (!oauthSettled) return prevView;
          window.history.replaceState({}, '', '/login');
          return 'login';
        } else if (session && (prevView === 'login' || (event === 'SIGNED_IN' && initialOAuthState.hasCodeOrToken))) {
          window.history.replaceState({}, '', '/dashboard');
          return 'user-dashboard';
        }
        return prevView;
      });
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Only block rendering for protected views or active OAuth callback exchange
  const isProtectedView = currentView === 'user-dashboard' || currentView === 'admin-dashboard' || currentView === 'enterprise-dashboard';
  if ((sessionLoading && isProtectedView) || oauthExchanging) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] dark:bg-black text-[#1a1c1c] dark:text-neutral-200 font-sans flex items-center justify-center font-bold text-xs uppercase tracking-wider text-neutral-400">
        {oauthExchanging ? 'Completing Google Sign-In...' : 'Loading CHIP NG...'}
      </div>
    );
  }

  // Set the browser URL back to root when navigating away from a public profile to a core app view.
  const handleNavigate = (view: ViewState, slug?: string) => {
    try {
      window.scrollTo({ top: 0, behavior: 'instant' as any });
    } catch (e) {}

    if (view !== 'public-profile' && publicUsername) {
      window.history.pushState({}, '', '/');
      setPublicUsername(null);
    }
    if (view !== 'blog-article' && blogSlug) {
      setBlogSlug(null);
    }
    if (view !== 'commercial-landing' && commercialSlug) {
      setCommercialSlug(null);
    }

    if (view === 'landing') {
      window.history.pushState({}, '', '/');
    } else if (view === 'login') {
      window.history.pushState({}, '', '/login');
    } else if (view === 'user-dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else if (view === 'admin-dashboard') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'enterprise-dashboard') {
      window.history.pushState({}, '', '/enterprise');
    } else if (view === 'nfc-sales') {
      window.history.pushState({}, '', '/buycard');
    } else if (view === 'corporate-bundle') {
      window.history.pushState({}, '', '/corporate-bundle');
    } else if (view === 'privacy-policy') {
      window.history.pushState({}, '', '/privacy-policy');
    } else if (view === 'terms-of-service') {
      window.history.pushState({}, '', '/terms-of-service');
    } else if (view === 'shipping') {
      window.history.pushState({}, '', '/shipping');
    } else if (view === 'refund-policy') {
      window.history.pushState({}, '', '/refund-policy');
    } else if (view === 'portfolio') {
      window.history.pushState({}, '', '/portfolio');
    } else if (view === 'onboarding') {
      window.history.pushState({}, '', '/onboarding');
    } else if ((view as string) === 'mobile-app') {
      window.history.pushState({}, '', '/');
      setCurrentView('landing');
      return;
    } else if (view === 'blog-directory') {
      window.history.pushState({}, '', '/blog');
    } else if (view === 'company') {
      window.history.pushState({}, '', '/company');
    } else if (view === 'updates') {
      window.history.pushState({}, '', '/updates');
    } else if (view === 'contact') {
      window.history.pushState({}, '', '/contact');
    } else if (view === 'commercial-landing' && slug) {
      window.history.pushState({}, '', `/${slug}`);
      setCommercialSlug(slug);
    } else if (view === 'public-profile') {
      const targetSlug = slug || publicUsername;
      if (targetSlug) {
        const clean = extractUsernameFromPath(targetSlug) || targetSlug;
        window.history.pushState({}, '', `/@${clean}`);
        setPublicUsername(clean);
      }
    }

    setCurrentView(view);
  };

  const handleNavigateToArticle = (slug: string) => {
    window.history.pushState({}, '', `/blog/${slug}`);
    setBlogSlug(slug);
    setCurrentView('blog-article');
  };

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white font-sans antialiased selection:bg-[#16a34a] selection:text-neutral-950">
        {currentView === 'landing' && <LandingView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}
        {currentView === 'company' && <MakroCompanyView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}
        {currentView === 'updates' && <MakroUpdatesView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}
        {currentView === 'contact' && <MakroContactView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}
        {currentView === 'login' && <LoginView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
        {currentView === 'user-dashboard' && <UserDashboard onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
        {currentView === 'public-profile' && <PublicProfileView onNavigate={handleNavigate} username={publicUsername} autoDownloadVCard={autoDownloadVCard} />}
        {currentView === 'admin-dashboard' && <AdminDashboard onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
        {currentView === 'enterprise-dashboard' && <EnterpriseDashboard onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
        {currentView === 'blog-directory' && <BlogDirectoryView onNavigate={handleNavigate} onNavigateToArticle={handleNavigateToArticle} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
        {currentView === 'nfc-sales' && <NfcSalesView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}
        {currentView === 'corporate-bundle' && <CorporateBundleView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}
        {currentView === 'blog-article' && <BlogArticleView onNavigate={handleNavigate} slug={blogSlug || ''} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
        {currentView === 'privacy-policy' && <PrivacyPolicyView onNavigate={handleNavigate} isDarkMode={isDarkMode} />}
        {currentView === 'terms-of-service' && <TermsOfServiceView onNavigate={handleNavigate} isDarkMode={isDarkMode} />}
        {currentView === 'shipping' && <ShippingPolicyView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
        {currentView === 'refund-policy' && <RefundPolicyView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
        {currentView === 'portfolio' && <PortfolioView onNavigate={handleNavigate} />}
        {currentView === 'onboarding' && <ClientOnboardingView onNavigate={handleNavigate} />}
        {currentView === 'commercial-landing' && commercialSlug && (
          <CommercialLandingView 
            slug={commercialSlug} 
            onNavigate={handleNavigate} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
            session={session} 
          />
        )}
        <ToastContainer />
      </div>
    </CurrencyProvider>
  );
}
