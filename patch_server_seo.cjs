const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `  // Auto Link API`;
const replacement = `  // Auto Meta Generation via Gemini
  app.post('/api/seo/auto-meta', async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: 'Content required' });
      
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = \`Analyze the following blog content and generate SEO metadata. 
Respond ONLY with a valid JSON object in this exact format:
{
  "meta_title": "Optimized SEO title under 60 chars",
  "meta_description": "Compelling meta description under 155 chars",
  "focus_keyword": "primary keyword phrase"
}

Content:
\${content.substring(0, 3000)}\`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      const text = response.text || '';
      const jsonStr = text.replace(/\\s*\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const metadata = JSON.parse(jsonStr);
      
      res.json(metadata);
    } catch (err: any) {
      console.error('Error generating AI meta:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Auto Link API`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
