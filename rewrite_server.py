import re

with open('server.ts', 'r') as f:
    code = f.read()

# I will find the Vite block
vite_start = code.find('// Vite middleware for development')

before = code[:vite_start]

end_block = """// Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        
        try {
          const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
          const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';
          const supabase = createClient(supabaseUrl, supabaseKey);

          const urlPath = req.path;
          if (urlPath.startsWith('/blog/') && urlPath.length > 6) {
            const slug = urlPath.slice(6);
            const { data: post } = await supabase.from('posts').select('title, meta_title, meta_description, cover_image_url').eq('slug', slug).single();
            if (post) {
              const title = post.meta_title || post.title;
              const desc = post.meta_description || '';
              template = template.replace(/<title>.*?<\\/title>/, `<title>${title}</title>`);
              template = template.replace(/<meta name="title" content=".*?"\\s*\\/?>/, `<meta name="title" content="${title}" />`);
              template = template.replace(/<meta name="description" content=".*?"\\s*\\/?>/, `<meta name="description" content="${desc}" />`);
              template = template.replace(/<meta property="og:title" content=".*?"\\s*\\/?>/, `<meta property="og:title" content="${title}" />`);
              template = template.replace(/<meta property="og:description" content=".*?"\\s*\\/?>/, `<meta property="og:description" content="${desc}" />`);
              if (post.cover_image_url) {
                 template = template.replace(/<meta property="og:image" content=".*?"\\s*\\/?>/, `<meta property="og:image" content="${post.cover_image_url}" />`);
                 template = template.replace(/<meta name="twitter:image" content=".*?"\\s*\\/?>/, `<meta name="twitter:image" content="${post.cover_image_url}" />`);
                 template = template.replace(/<meta property="twitter:image" content=".*?"\\s*\\/?>/, `<meta property="twitter:image" content="${post.cover_image_url}" />`);
              }
            }
          } else if (!urlPath.startsWith('/admin') && !urlPath.startsWith('/enterprise') && !urlPath.startsWith('/login') && !urlPath.startsWith('/dashboard') && !urlPath.startsWith('/api') && urlPath !== '/' && urlPath !== '/blog') {
            let username = urlPath.slice(1);
            if (username.endsWith('/vcard')) username = username.replace(/\\/vcard$/, '');
            const { data: profile } = await supabase.from('profiles').select('full_name, headline, bio, cover_image_url').eq('username', username).single();
            if (profile) {
              const title = `${profile.full_name} | CHIP NG`;
              const desc = profile.headline || profile.bio || "View my digital profile on CHIP NG.";
              template = template.replace(/<title>.*?<\\/title>/, `<title>${title}</title>`);
              template = template.replace(/<meta name="title" content=".*?"\\s*\\/?>/, `<meta name="title" content="${title}" />`);
              template = template.replace(/<meta name="description" content=".*?"\\s*\\/?>/, `<meta name="description" content="${desc}" />`);
              template = template.replace(/<meta property="og:title" content=".*?"\\s*\\/?>/, `<meta property="og:title" content="${title}" />`);
              template = template.replace(/<meta property="og:description" content=".*?"\\s*\\/?>/, `<meta property="og:description" content="${desc}" />`);
              if (profile.cover_image_url) {
                 template = template.replace(/<meta property="og:image" content=".*?"\\s*\\/?>/, `<meta property="og:image" content="${profile.cover_image_url}" />`);
                 template = template.replace(/<meta name="twitter:image" content=".*?"\\s*\\/?>/, `<meta name="twitter:image" content="${profile.cover_image_url}" />`);
                 template = template.replace(/<meta property="twitter:image" content=".*?"\\s*\\/?>/, `<meta property="twitter:image" content="${profile.cover_image_url}" />`);
              }
            }
          }
        } catch (e) {
          console.error("SEO Injection error", e);
        }

        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', async (req, res) => {
      let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
      
      try {
        const urlPath = req.path;
        const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (urlPath.startsWith('/blog/') && urlPath.length > 6) {
          const slug = urlPath.slice(6);
          const { data: post } = await supabase.from('posts').select('title, meta_title, meta_description, cover_image_url').eq('slug', slug).single();
          if (post) {
            const title = post.meta_title || post.title;
            const desc = post.meta_description || '';
            html = html.replace(/<title>.*?<\\/title>/, `<title>${title}</title>`);
            html = html.replace(/<meta name="title" content=".*?"\\s*\\/?>/, `<meta name="title" content="${title}" />`);
            html = html.replace(/<meta name="description" content=".*?"\\s*\\/?>/, `<meta name="description" content="${desc}" />`);
            html = html.replace(/<meta property="og:title" content=".*?"\\s*\\/?>/, `<meta property="og:title" content="${title}" />`);
            html = html.replace(/<meta property="og:description" content=".*?"\\s*\\/?>/, `<meta property="og:description" content="${desc}" />`);
            if (post.cover_image_url) {
               html = html.replace(/<meta property="og:image" content=".*?"\\s*\\/?>/, `<meta property="og:image" content="${post.cover_image_url}" />`);
               html = html.replace(/<meta name="twitter:image" content=".*?"\\s*\\/?>/, `<meta name="twitter:image" content="${post.cover_image_url}" />`);
               html = html.replace(/<meta property="twitter:image" content=".*?"\\s*\\/?>/, `<meta property="twitter:image" content="${post.cover_image_url}" />`);
            }
          }
        } else if (!urlPath.startsWith('/admin') && !urlPath.startsWith('/enterprise') && !urlPath.startsWith('/login') && !urlPath.startsWith('/dashboard') && !urlPath.startsWith('/api') && urlPath !== '/' && urlPath !== '/blog') {
          let username = urlPath.slice(1);
          if (username.endsWith('/vcard')) username = username.replace(/\\/vcard$/, '');
          const { data: profile } = await supabase.from('profiles').select('full_name, headline, bio, cover_image_url').eq('username', username).single();
          if (profile) {
            const title = `${profile.full_name} | CHIP NG`;
            const desc = profile.headline || profile.bio || "View my digital profile on CHIP NG.";
            html = html.replace(/<title>.*?<\\/title>/, `<title>${title}</title>`);
            html = html.replace(/<meta name="title" content=".*?"\\s*\\/?>/, `<meta name="title" content="${title}" />`);
            html = html.replace(/<meta name="description" content=".*?"\\s*\\/?>/, `<meta name="description" content="${desc}" />`);
            html = html.replace(/<meta property="og:title" content=".*?"\\s*\\/?>/, `<meta property="og:title" content="${title}" />`);
            html = html.replace(/<meta property="og:description" content=".*?"\\s*\\/?>/, `<meta property="og:description" content="${desc}" />`);
            if (profile.cover_image_url) {
               html = html.replace(/<meta property="og:image" content=".*?"\\s*\\/?>/, `<meta property="og:image" content="${profile.cover_image_url}" />`);
               html = html.replace(/<meta name="twitter:image" content=".*?"\\s*\\/?>/, `<meta name="twitter:image" content="${profile.cover_image_url}" />`);
               html = html.replace(/<meta property="twitter:image" content=".*?"\\s*\\/?>/, `<meta property="twitter:image" content="${profile.cover_image_url}" />`);
            }
          }
        }
      } catch (e) {
        console.error("SEO Injection error", e);
      }
      res.send(html);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
"""

with open('server.ts', 'w') as f:
    f.write(before + end_block.replace('\\', '\\\\'))
    
print("Rewrote server.ts")
