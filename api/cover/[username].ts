import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * High-performance Dedicated Vercel Serverless Function for Profile Cover Images.
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

    const cleanUsername = String(rawUsername).replace(/^@/, '').toLowerCase().trim();

    if (!cleanUsername) {
      return streamFallbackLogo(res);
    }

    const supabase = getSupabase();
    const { data: profile } = await supabase
      .from('profiles')
      .select('cover_image_url, full_name, username')
      .ilike('username', cleanUsername)
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
