import re

with open('server.ts', 'r') as f:
    code = f.read()

# Replace the block at the end
old_vite_block = """  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }"""

new_vite_block = """
  const fs = require('fs');
  const path = require('path');
  
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
        
        // SEO Injection
        try {
          const urlPath = req.path;
          if (urlPath.startsWith('/blog/') && urlPath.length > 6) {
            const slug = urlPath.slice(6);
            const post = db.prepare("SELECT title, meta_title, meta_description, cover_image_url FROM posts WHERE slug = ?").get(slug);
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
            const profile = db.prepare("SELECT full_name, headline, bio, cover_image_url FROM profiles WHERE username = ?").get(username);
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
    app.use(express.static(distPath, { index: false })); // don't serve index.html automatically
    app.get('*', (req, res) => {
      let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
      
      try {
        const urlPath = req.path;
        if (urlPath.startsWith('/blog/') && urlPath.length > 6) {
          const slug = urlPath.slice(6);
          const post = db.prepare("SELECT title, meta_title, meta_description, cover_image_url FROM posts WHERE slug = ?").get(slug);
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
          const profile = db.prepare("SELECT full_name, headline, bio, cover_image_url FROM profiles WHERE username = ?").get(username);
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
  }"""

code = code.replace(old_vite_block, new_vite_block)

with open('server.ts', 'w') as f:
    f.write(code)

print("Injected SEO logic")
