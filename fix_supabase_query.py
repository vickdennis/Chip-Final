import re

with open('server.ts', 'r') as f:
    code = f.read()

old_block_pattern = r"// SEO Injection.*?} catch \(e\) \{\s*console\.error\(\"SEO Injection error\", e\);\s*\}"

new_block = r"""// SEO Injection
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
              template = template.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
              template = template.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${title}" />`);
              template = template.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${desc}" />`);
              template = template.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
              template = template.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${desc}" />`);
              if (post.cover_image_url) {
                 template = template.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${post.cover_image_url}" />`);
                 template = template.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${post.cover_image_url}" />`);
                 template = template.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/, `<meta property="twitter:image" content="${post.cover_image_url}" />`);
              }
            }
          } else if (!urlPath.startsWith('/admin') && !urlPath.startsWith('/enterprise') && !urlPath.startsWith('/login') && !urlPath.startsWith('/dashboard') && !urlPath.startsWith('/api') && urlPath !== '/' && urlPath !== '/blog') {
            let username = urlPath.slice(1);
            if (username.endsWith('/vcard')) username = username.replace(/\/vcard$/, '');
            const { data: profile } = await supabase.from('profiles').select('full_name, headline, bio, cover_image_url').eq('username', username).single();
            if (profile) {
              const title = `${profile.full_name} | CHIP NG`;
              const desc = profile.headline || profile.bio || "View my digital profile on CHIP NG.";
              template = template.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
              template = template.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${title}" />`);
              template = template.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${desc}" />`);
              template = template.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
              template = template.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${desc}" />`);
              if (profile.cover_image_url) {
                 template = template.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${profile.cover_image_url}" />`);
                 template = template.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${profile.cover_image_url}" />`);
                 template = template.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/, `<meta property="twitter:image" content="${profile.cover_image_url}" />`);
              }
            }
          }
        } catch (e) {
          console.error("SEO Injection error", e);
        }"""

code = re.sub(old_block_pattern, new_block.replace('\\', '\\\\'), code, flags=re.DOTALL)

old_prod_pattern = r"const urlPath = req\.path;.*?console\.error\(\"SEO Injection error\", e\);\s*\}"

new_prod_block = r"""const urlPath = req.path;
        const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (urlPath.startsWith('/blog/') && urlPath.length > 6) {
          const slug = urlPath.slice(6);
          const { data: post } = await supabase.from('posts').select('title, meta_title, meta_description, cover_image_url').eq('slug', slug).single();
          if (post) {
            const title = post.meta_title || post.title;
            const desc = post.meta_description || '';
            html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
            html = html.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${title}" />`);
            html = html.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${desc}" />`);
            html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
            html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${desc}" />`);
            if (post.cover_image_url) {
               html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${post.cover_image_url}" />`);
               html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${post.cover_image_url}" />`);
               html = html.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/, `<meta property="twitter:image" content="${post.cover_image_url}" />`);
            }
          }
        } else if (!urlPath.startsWith('/admin') && !urlPath.startsWith('/enterprise') && !urlPath.startsWith('/login') && !urlPath.startsWith('/dashboard') && !urlPath.startsWith('/api') && urlPath !== '/' && urlPath !== '/blog') {
          let username = urlPath.slice(1);
          if (username.endsWith('/vcard')) username = username.replace(/\/vcard$/, '');
          const { data: profile } = await supabase.from('profiles').select('full_name, headline, bio, cover_image_url').eq('username', username).single();
          if (profile) {
            const title = `${profile.full_name} | CHIP NG`;
            const desc = profile.headline || profile.bio || "View my digital profile on CHIP NG.";
            html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
            html = html.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${title}" />`);
            html = html.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${desc}" />`);
            html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
            html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${desc}" />`);
            if (profile.cover_image_url) {
               html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${profile.cover_image_url}" />`);
               html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${profile.cover_image_url}" />`);
               html = html.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/, `<meta property="twitter:image" content="${profile.cover_image_url}" />`);
            }
          }
        }
      } catch (e) {
        console.error("SEO Injection error", e);
      }"""

code = code.replace("app.get('*', (req, res) => {", "app.get('*', async (req, res) => {")
code = re.sub(old_prod_pattern, new_prod_block.replace('\\', '\\\\'), code, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(code)

print("Fixed supabase queries")
