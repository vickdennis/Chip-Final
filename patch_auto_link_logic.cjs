const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldLogic = `let text = child.data;
            let modified = false;

            for (const kw of keywords) {
              if (linkCount >= MAX_LINKS && productLinkCount >= MAX_PRODUCT_LINKS) break;
              
              // Don't link to itself
              if (kw.target_url_slug === \`/blog/\${post_slug}\` || kw.target_url_slug === post_slug) continue;

              const regex = new RegExp(\`\\\\b(\${kw.keyword_phrase})\\\\b\`, 'i');
              if (regex.test(text)) {
                if (kw.type === 'product') {
                  if (productLinkCount >= MAX_PRODUCT_LINKS) continue;
                  productLinkCount++;
                } else {
                  if (linkCount >= MAX_LINKS) continue;
                  linkCount++;
                }

                const replacement = \`<a href="\${kw.target_url_slug}" title="Read more about \${kw.keyword_phrase}" rel="dofollow">\${text.match(regex)[0]}</a>\`;
                text = text.replace(regex, replacement);
                modified = true;
                
                // Track link
                insertLog.run(post_slug, kw.target_url_slug, kw.keyword_phrase);
                
                // Only replace first occurrence per keyword per run
                break; 
              }
            }

            if (modified) {
              $(child).replaceWith(text);
            }`;

const newLogic = `let text = child.data;
            let modified = false;
            let replacements = [];

            for (const kw of keywords) {
              if (linkCount >= MAX_LINKS && productLinkCount >= MAX_PRODUCT_LINKS) break;
              
              // Don't link to itself
              if (kw.target_url_slug === \`/blog/\${post_slug}\` || kw.target_url_slug === post_slug) continue;

              const regex = new RegExp(\`\\\\b(\${kw.keyword_phrase})\\\\b\`, 'i');
              if (regex.test(text)) {
                if (kw.type === 'product') {
                  if (productLinkCount >= MAX_PRODUCT_LINKS) continue;
                  productLinkCount++;
                } else {
                  if (linkCount >= MAX_LINKS) continue;
                  linkCount++;
                }

                const matched = text.match(regex)[0];
                const placeholder = \`__KW_LINK_\${replacements.length}__\`;
                replacements.push(\`<a href="\${kw.target_url_slug}" title="Read more about \${kw.keyword_phrase}" rel="dofollow">\${matched}</a>\`);
                text = text.replace(regex, placeholder);
                modified = true;
                
                insertLog.run(post_slug, kw.target_url_slug, kw.keyword_phrase);
              }
            }

            if (modified) {
              for (let i = 0; i < replacements.length; i++) {
                text = text.replace(\`__KW_LINK_\${i}__\`, replacements[i]);
              }
              $(child).replaceWith(text);
            }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('server.ts', code);
