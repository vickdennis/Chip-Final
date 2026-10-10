import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

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

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
