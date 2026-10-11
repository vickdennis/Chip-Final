import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { applyUniversalSsr } from '../src/utils/universalSsrEngine';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

const app = express();
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Base HTML loader for Vercel Serverless SSR
let cachedBaseHtml: string | null = null;
function getBaseHtml(): string {
  if (cachedBaseHtml) return cachedBaseHtml;
  try {
    const distHtml = path.join(process.cwd(), 'dist', 'index.html');
    if (fs.existsSync(distHtml)) {
      cachedBaseHtml = fs.readFileSync(distHtml, 'utf-8');
      return cachedBaseHtml;
    }
  } catch (e) {}
  try {
    const rootHtml = path.join(process.cwd(), 'index.html');
    if (fs.existsSync(rootHtml)) {
      cachedBaseHtml = fs.readFileSync(rootHtml, 'utf-8');
      return cachedBaseHtml;
    }
  } catch (e) {}
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CHIP NG</title></head><body><div id="root"></div></body></html>';
}

// Serverless SSR Handler for User Profiles & Social Crawlers on Vercel
async function handleServerlessSsr(urlPath: string, req: Request, res: Response) {
  try {
    const supabase = getSupabase();
    let html = getBaseHtml();

    html = await applyUniversalSsr(html, {
      urlPath,
      userAgent: req.headers['user-agent'] as string,
      supabase,
      db: null
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
    res.setHeader('X-Robots-Tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    return res.send(html);
  } catch (err: any) {
    console.error('Serverless SSR Error:', err);
    return res.send(getBaseHtml());
  }
}

// SSR rewrite interception middleware for Vercel
app.use(async (req, res, next) => {
  if (req.query.ssrPath || req.query.profile) {
    const rawTarget = (req.query.ssrPath || req.query.profile || '') as string;
    let targetPath = String(rawTarget).trim();
    if (!targetPath.startsWith('/') && !targetPath.startsWith('@')) {
      targetPath = `/${targetPath}`;
    }
    return handleServerlessSsr(targetPath, req, res);
  }
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Dynamic Cover Photo Proxy for Open Graph & Social Sharing ---
// Bypasses Supabase storage 'x-robots-tag: none' so WhatsApp, Twitter/X, iMessage, LinkedIn preview cards work
app.get('/api/cover/:username', async (req: Request, res: Response) => {
  try {
    let rawUsername = req.params.username || '';
    try {
      rawUsername = decodeURIComponent(rawUsername);
    } catch (e) {}
    rawUsername = rawUsername.replace(/^@/, '').toLowerCase().trim();

    const supabase = getSupabase();
    const { data: profile } = await supabase
      .from('profiles')
      .select('cover_image_url, full_name, username')
      .ilike('username', rawUsername)
      .maybeSingle();

    let imageUrl = profile?.cover_image_url;

    if (imageUrl && typeof imageUrl === 'string') {
      imageUrl = imageUrl.trim();
      let fetchUrl = imageUrl;
      if (!fetchUrl.startsWith('http')) {
        if (fetchUrl.startsWith('/')) {
          fetchUrl = `https://oxrzkdzcagvmgfuthyjd.supabase.co${fetchUrl}`;
        } else {
          fetchUrl = `https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/${fetchUrl}`;
        }
      }

      try {
        const imgRes = await fetch(fetchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CHIPNG-Bot/1.0; +https://www.chipng.com)'
          }
        });
        if (imgRes.ok) {
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', buffer.length.toString());
          res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
          res.setHeader('X-Robots-Tag', 'all, index, follow, max-image-preview:large');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.send(buffer);
        }
      } catch (fetchErr) {
        console.warn(`Error fetching cover image for ${rawUsername}:`, fetchErr);
      }
    }

    // High quality local brand fallback (zero network latency)
    try {
      const localLogoPath = path.join(process.cwd(), 'public', 'chipng_3d_logo.jpg');
      if (fs.existsSync(localLogoPath)) {
        const buffer = fs.readFileSync(localLogoPath);
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', buffer.length.toString());
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
        res.setHeader('X-Robots-Tag', 'all, index, follow, max-image-preview:large');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(buffer);
      }
    } catch (e) {}

    const fallbackRes = await fetch('https://www.chipng.com/chipng_3d_logo.jpg');
    if (fallbackRes.ok) {
      const buffer = Buffer.from(await fallbackRes.arrayBuffer());
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', buffer.length.toString());
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      res.setHeader('X-Robots-Tag', 'all, index, follow, max-image-preview:large');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(buffer);
    }

    res.redirect(302, 'https://www.chipng.com/chipng_3d_logo.jpg');
  } catch (err) {
    res.redirect(302, 'https://www.chipng.com/chipng_3d_logo.jpg');
  }
});

app.get('/api/cover', async (req: Request, res: Response) => {
  try {
    const rawUrl = (req.query.url || req.query.u) as string;
    if (rawUrl && typeof rawUrl === 'string' && rawUrl.startsWith('http')) {
      const imgRes = await fetch(rawUrl);
      if (imgRes.ok) {
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', buffer.length.toString());
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
        res.setHeader('X-Robots-Tag', 'all, index, follow, max-image-preview:large');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(buffer);
      }
    }
    res.redirect(302, 'https://www.chipng.com/chipng_3d_logo.jpg');
  } catch (e) {
    res.redirect(302, 'https://www.chipng.com/chipng_3d_logo.jpg');
  }
});

// Dynamic Profile SSR Endpoint (Matches /@username, /p/username, etc.)
app.get('/api/profile-ssr', async (req: Request, res: Response) => {
  const username = (req.query.username || req.query.u || '') as string;
  let cleanUser = String(username).trim();
  if (cleanUser.startsWith('@')) cleanUser = cleanUser.slice(1);
  const path = cleanUser ? `/@${cleanUser}` : '/';
  await handleServerlessSsr(path, req, res);
});

// General Bot SSR Endpoint (Rewritten from crawlers)
app.get('/api/ssr', async (req: Request, res: Response) => {
  const reqPath = (req.query.path || req.query.p || '/') as string;
  await handleServerlessSsr(String(reqPath).startsWith('/') ? String(reqPath) : `/${reqPath}`, req, res);
});

// --- Analytics Endpoints ---
app.post('/api/analytics/view', (req: Request, res: Response) => {
  res.json({ success: true, recorded_at: new Date().toISOString() });
});

app.post('/api/analytics/click', (req: Request, res: Response) => {
  res.json({ success: true, recorded_at: new Date().toISOString() });
});

app.post('/api/analytics/batch-views', (req: Request, res: Response) => {
  res.json({ totalViews: 0 });
});

app.get('/api/analytics/user/:profileId', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const supabase = getSupabase();

    // Query leads for this user to correlate contact engagement
    const idsToMatch = [profileId];
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
      const { data } = await (isUuid 
        ? supabase.from('profiles').select('id, username').eq('id', profileId).maybeSingle()
        : supabase.from('profiles').select('id, username').eq('username', profileId).maybeSingle());
      if (data) {
        if (data.id && !idsToMatch.includes(data.id)) idsToMatch.push(data.id);
        if (data.username && !idsToMatch.includes(data.username)) idsToMatch.push(data.username);
      }
    } catch (e) {}

    const postSlugs = idsToMatch.map(id => `profile_${id}`).concat(idsToMatch);
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .in('post_slug', postSlugs)
      .order('created_at', { ascending: false });

    const totalLeads = leads?.length || 0;
    const recentActivity = (leads || []).slice(0, 8).map(l => ({
      event_type: 'lead_captured',
      detail: `Contact captured: ${l.name}`,
      created_at: l.created_at
    }));

    res.json({
      totalViews: 0,
      totalClicks: totalLeads,
      ctr: 0,
      nfcTaps: 0,
      qrScans: 0,
      webViews: 0,
      clicksByType: totalLeads > 0 ? [{ click_type: 'lead_capture', count: totalLeads }] : [],
      topLinks: [],
      recentActivity
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Leads & CRM Endpoints ---
app.post('/api/leads/capture', async (req: Request, res: Response) => {
  try {
    const { profile_id, name, whatsapp, email, company, message, source, city } = req.body;
    if (!name || (!whatsapp && !email)) {
      return res.status(400).json({ error: 'Name and either WhatsApp or Email are required.' });
    }

    const cleanName = (name || '').trim();
    const cleanWhatsapp = (whatsapp || '').trim();
    const cleanEmail = (email || '').trim();
    const cleanCompany = (company || '').trim();
    const cleanMessage = (message || '').trim();
    const cleanCity = (city || 'Lagos').trim();
    const cleanSource = source || 'profile_nfc_tap';
    const cleanStatus = 'new';
    const postSlug = profile_id ? `profile_${profile_id}` : 'profile_capture';

    const supabase = getSupabase();
    const metaPayload = {
      profile_id,
      email: cleanEmail,
      whatsapp: cleanWhatsapp,
      company: cleanCompany,
      message: cleanMessage,
      status: cleanStatus,
      city: cleanCity,
      source: cleanSource,
      saved_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('leads').insert([{
      name: cleanName,
      whatsapp: cleanWhatsapp || cleanEmail || 'Contact Captured',
      city: JSON.stringify(metaPayload),
      post_slug: postSlug,
      source: cleanSource
    }]).select();

    if (error) {
      console.error('Supabase capture error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      lead_id: data?.[0]?.id,
      saved_in_supabase: true
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leads/profile/:profileId', async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const supabase = getSupabase();
    const idsToMatch = [profileId];

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
      const { data } = await (isUuid 
        ? supabase.from('profiles').select('id, username').eq('id', profileId).maybeSingle()
        : supabase.from('profiles').select('id, username').eq('username', profileId).maybeSingle());
      if (data) {
        if (data.id && !idsToMatch.includes(data.id)) idsToMatch.push(data.id);
        if (data.username && !idsToMatch.includes(data.username)) idsToMatch.push(data.username);
      }
    } catch (e) {}

    const postSlugs = idsToMatch.map(id => `profile_${id}`).concat(idsToMatch);
    const { data: spLeads, error } = await supabase
      .from('leads')
      .select('*')
      .in('post_slug', postSlugs)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const parsedLeads = (spLeads || []).map((sp: any) => {
      let meta: any = {};
      if (sp.city && typeof sp.city === 'string' && sp.city.startsWith('{')) {
        try { meta = JSON.parse(sp.city); } catch (e) {}
      }
      return {
        id: sp.id,
        profile_id: meta.profile_id || sp.profile_id || profileId,
        name: sp.name,
        whatsapp: meta.whatsapp || sp.whatsapp || '',
        email: meta.email || sp.email || '',
        company: meta.company || sp.company || '',
        message: meta.message || sp.message || '',
        source: sp.source || 'profile',
        city: meta.city || 'Lagos',
        status: meta.status || sp.status || 'new',
        created_at: sp.created_at
      };
    });

    const total = parsedLeads.length;
    const newCount = parsedLeads.filter(l => l.status === 'new' || !l.status).length;
    const convertedCount = parsedLeads.filter(l => l.status === 'converted').length;

    res.json({ leads: parsedLeads, total, newCount, convertedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/leads/:leadId/status', async (req: Request, res: Response) => {
  try {
    const { status, name, whatsapp, email, profile_id } = req.body;
    const { leadId } = req.params;
    const cleanStatus = status || 'new';
    const supabase = getSupabase();

    // Fetch existing lead metadata from Supabase
    const { data: spLead } = await supabase.from('leads').select('city').eq('id', leadId).maybeSingle();
    let meta: any = {};
    if (spLead?.city && typeof spLead.city === 'string' && spLead.city.startsWith('{')) {
      try { meta = JSON.parse(spLead.city); } catch (e) {}
    } else {
      meta = {
        profile_id,
        email,
        whatsapp,
        name
      };
    }
    meta.status = cleanStatus;
    meta.updated_at = new Date().toISOString();

    await supabase.from('leads').update({ city: JSON.stringify(meta) }).eq('id', leadId);

    try {
      await supabase.from('leads').update({ status: cleanStatus }).eq('id', leadId);
    } catch (e) {}

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/leads/:leadId', async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const supabase = getSupabase();
    await supabase.from('leads').delete().eq('id', leadId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Blog lead capture
app.post('/api/lead', async (req: Request, res: Response) => {
  try {
    const { name, whatsapp, city, post_slug, source, clicked_variant } = req.body;
    const supabase = getSupabase();
    await supabase.from('leads').insert([{
      name, whatsapp, city, post_slug, source, clicked_variant: clicked_variant || null
    }]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
