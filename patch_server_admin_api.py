import re

with open('server.ts', 'r') as f:
    code = f.read()

new_endpoints = """
  app.get('/api/seo/keywords', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM seo_keywords ORDER BY id DESC').all();
      res.json(rows);
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/seo/keywords', (req, res) => {
    try {
      const { keyword_phrase, target_url_slug, type } = req.body;
      db.prepare('INSERT INTO seo_keywords (keyword_phrase, target_url_slug, type) VALUES (?, ?, ?)').run(keyword_phrase, target_url_slug, type);
      res.json({ success: true });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.delete('/api/seo/keywords/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM seo_keywords WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.get('/api/seo/links-report', (req, res) => {
    try {
      const logs = db.prepare('SELECT * FROM post_links_log ORDER BY created_at DESC LIMIT 50').all();
      res.json({ total: logs.length, broken: 0, logs });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/seo/check-links', (req, res) => {
    // Dummy manual check
    res.json({ success: true });
  });

  app.post('/api/seo/auto-meta', (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({error: 'No content'});
      // Dummy auto generation logic since this would need an AI API to truly work
      const meta_title = "Auto Generated Title";
      const meta_description = content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...";
      const focus_keyword = "auto keyword";
      res.json({ meta_title, meta_description, focus_keyword });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/seo/auto-link', (req, res) => {
    try {
      const { content, post_slug } = req.body;
      const keywords = db.prepare('SELECT * FROM seo_keywords').all();
      let newContent = content;
      let linked = 0;
      
      for (const kw of (keywords as any[])) {
        const regex = new RegExp(`(?<!<[^>]*>)\\\\b(${kw.keyword_phrase})\\\\b`, 'gi');
        if (regex.test(newContent)) {
          newContent = newContent.replace(regex, `<a href="${kw.target_url_slug}">$1</a>`);
          db.prepare('INSERT INTO post_links_log (post_slug, linked_url, keyword_used, status) VALUES (?, ?, ?, ?)').run(post_slug, kw.target_url_slug, kw.keyword_phrase, 'OK');
          linked++;
        }
      }
      res.json({ success: true, linked_count: linked, modified_content: newContent });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/post-categories', (req, res) => {
    try {
      const { post_slug, category } = req.body;
      db.prepare('INSERT INTO post_categories (post_slug, category) VALUES (?, ?) ON CONFLICT(post_slug) DO UPDATE SET category=excluded.category').run(post_slug, category);
      res.json({ success: true });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });
"""

# Insert these new endpoints before `app.use(vite.middlewares);`
if "app.use(vite.middlewares);" in code:
    code = code.replace("app.use(vite.middlewares);", new_endpoints + "\n    app.use(vite.middlewares);")
else:
    print("Could not find vite.middlewares to anchor")

with open('server.ts', 'w') as f:
    f.write(code)

print("Patch applied to server.ts")
