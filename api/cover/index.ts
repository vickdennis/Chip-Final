import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Universal Cover Image Proxy for CHIP NG.
 * Route: /api/cover?username=stickman OR /api/cover?url=https://...
 * Strips 'x-robots-tag: none' and guarantees image delivery for social crawlers.
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const rawUrl = (req.query?.url || req.query?.u) as string;
    let username = (req.query?.username || req.query?.user) as string;

    // Direct image URL proxy
    if (rawUrl && typeof rawUrl === 'string' && rawUrl.startsWith('http')) {
      try {
        const imgRes = await fetch(rawUrl, {
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
      } catch (e) {}
    }

    // Username lookup
    if (username) {
      if (Array.isArray(username)) username = username[0];
      const cleanUsername = String(username).replace(/^@/, '').toLowerCase().trim();
      const supabase = getSupabase();
      const { data: profile } = await supabase
        .from('profiles')
        .select('cover_image_url')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (profile?.cover_image_url) {
        let fetchUrl = profile.cover_image_url.trim();
        if (!fetchUrl.startsWith('http')) {
          if (fetchUrl.startsWith('/')) {
            fetchUrl = `https://oxrzkdzcagvmgfuthyjd.supabase.co${fetchUrl}`;
          } else {
            fetchUrl = `https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/${fetchUrl}`;
          }
        }
        try {
          const imgRes = await fetch(fetchUrl);
          if (imgRes.ok) {
            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
            const buffer = Buffer.from(await imgRes.arrayBuffer());

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', buffer.length.toString());
            res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
            res.setHeader('X-Robots-Tag', 'all, index, follow, max-image-preview:large');
            return res.status(200).send(buffer);
          }
        } catch (e) {}
      }
    }

    // Fallback to high-res brand asset
    const fallbackRes = await fetch('https://www.chipng.com/chipng_3d_logo.jpg');
    if (fallbackRes.ok) {
      const buffer = Buffer.from(await fallbackRes.arrayBuffer());
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', buffer.length.toString());
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      res.setHeader('X-Robots-Tag', 'all, index, follow, max-image-preview:large');
      return res.status(200).send(buffer);
    }

    return res.redirect(302, 'https://www.chipng.com/chipng_3d_logo.jpg');
  } catch (err) {
    return res.redirect(302, 'https://www.chipng.com/chipng_3d_logo.jpg');
  }
}
