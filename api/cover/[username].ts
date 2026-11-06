import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * High-performance Dedicated Vercel Serverless Function for Profile Cover & Avatar Images.
 * Route: /api/cover/:username
 * Strips Supabase storage 'x-robots-tag: none' and serves rich OpenGraph & Twitter image headers
 * for WhatsApp, Facebook, Twitter/X, LinkedIn, iMessage, Slack, Discord, and Telegram.
 */
export default async function handler(req: any, res: any) {
  // CORS & crawler-friendly headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let rawUsername = req.query?.username || '';
    if (Array.isArray(rawUsername)) rawUsername = rawUsername[0];
    
    // Extract from url path if not in query
    if (!rawUsername && req.url) {
      const match = req.url.match(/\/api\/cover\/([^?/#]+)/i) || req.url.match(/\/cover\/([^?/#]+)/i);
      if (match) rawUsername = match[1];
    }

    try {
      rawUsername = decodeURIComponent(String(rawUsername));
    } catch (e) {}

    const cleanUsername = String(rawUsername).replace(/^@+/, '').toLowerCase().trim();

    if (!cleanUsername) {
      return streamFallbackLogo(res);
    }

    const supabase = getSupabase();
    
    // Multi-stage profile lookup ensuring admin-created users are resolved accurately
    let { data: profile } = await supabase
      .from('profiles')
      .select('cover_image_url, avatar_url, photo_url, avatar, image, profile_image, card_image_url, full_name, username, id')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (!profile) {
      const atRes = await supabase
        .from('profiles')
        .select('cover_image_url, avatar_url, photo_url, avatar, image, profile_image, card_image_url, full_name, username, id')
        .ilike('username', `@${cleanUsername}`)
        .maybeSingle();
      if (atRes.data) profile = atRes.data;
    }

    if (!profile) {
      const exactRes = await supabase
        .from('profiles')
        .select('cover_image_url, avatar_url, photo_url, avatar, image, profile_image, card_image_url, full_name, username, id')
        .eq('username', cleanUsername)
        .maybeSingle();
      if (exactRes.data) profile = exactRes.data;
    }

    // Check UUID lookup
    if (!profile && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUsername)) {
      const idRes = await supabase
        .from('profiles')
        .select('cover_image_url, avatar_url, photo_url, avatar, image, profile_image, card_image_url, full_name, username, id')
        .eq('id', cleanUsername)
        .maybeSingle();
      if (idRes.data) profile = idRes.data;
    }

    // Candidate lookup fallback
    if (!profile) {
      const { data: candidates } = await supabase
        .from('profiles')
        .select('cover_image_url, avatar_url, photo_url, avatar, image, profile_image, card_image_url, full_name, username, id')
        .order('created_at', { ascending: false })
        .limit(250);

      if (candidates && candidates.length > 0) {
        const targetClean = cleanUsername.toLowerCase().trim();
        const targetAlpha = targetClean.replace(/[^a-z0-9]/g, '');
        const found = candidates.find((p: any) => {
          if (!p.username) return false;
          const pClean = p.username.toLowerCase().trim().replace(/^@+/, '');
          const pAlpha = pClean.replace(/[^a-z0-9]/g, '');
          return pClean === targetClean || (targetAlpha.length >= 3 && pAlpha === targetAlpha);
        });
        if (found) profile = found;
      }
    }

    // Multi-column image discovery
    let imageUrl = 
      profile?.cover_image_url || 
      profile?.avatar_url || 
      profile?.photo_url || 
      profile?.avatar || 
      profile?.image || 
      profile?.profile_image ||
      profile?.card_image_url;

    // Handle base64 encoded image directly
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
      const parts = imageUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const buffer = Buffer.from(parts[1], 'base64');
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', buffer.length.toString());
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      res.setHeader('X-Robots-Tag', 'all, index, follow, max-image-preview:large');
      return res.status(200).send(buffer);
    }

    if (imageUrl && typeof imageUrl === 'string') {
      imageUrl = imageUrl.trim();
      let fetchUrl = imageUrl;
      if (!fetchUrl.startsWith('http')) {
        if (fetchUrl.startsWith('/')) {
          fetchUrl = `https://oxrzkdzcagvmgfuthyjd.supabase.co${fetchUrl}`;
        } else if (fetchUrl.startsWith('covers/') || fetchUrl.startsWith('avatars/')) {
          fetchUrl = `https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/${fetchUrl}`;
        } else {
          fetchUrl = `https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/${fetchUrl}`;
        }
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const imgRes = await fetch(fetchUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CHIPNG-Bot/1.0; +https://www.chipng.com)'
          }
        });
        clearTimeout(timeoutId);

        if (imgRes.ok) {
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          const buffer = Buffer.from(await imgRes.arrayBuffer());

          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', buffer.length.toString());
          res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
          res.setHeader('X-Robots-Tag', 'all, index, follow, max-image-preview:large');
          return res.status(200).send(buffer);
        }
      } catch (fetchErr) {
        console.warn(`Error fetching cover image for ${cleanUsername}:`, fetchErr);
      }
    }

    // Fallback to high-res brand image
    return await streamFallbackLogo(res);
  } catch (err: any) {
    console.error('Cover image handler error:', err);
    return res.redirect(302, 'https://www.chipng.com/chipng_3d_logo.jpg');
  }
}

async function streamFallbackLogo(res: any) {
  try {
    const fallbackRes = await fetch('https://www.chipng.com/chipng_3d_logo.jpg');
    if (fallbackRes.ok) {
      const buffer = Buffer.from(await fallbackRes.arrayBuffer());
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', buffer.length.toString());
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      res.setHeader('X-Robots-Tag', 'all, index, follow, max-image-preview:large');
      return res.status(200).send(buffer);
    }
  } catch (e) {}

  return res.redirect(302, 'https://www.chipng.com/chipng_3d_logo.jpg');
}
