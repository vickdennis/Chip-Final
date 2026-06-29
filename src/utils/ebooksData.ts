export interface Ebook {
  id: string;
  title: string;
  author: string;
  category: string;
  content: string;
}

export const ebooksData: Ebook[] = [
  {
    id: "1",
    title: "The Afrobeats Playbook",
    author: "Davido & Wizkid",
    category: "MUSIC & BRANDING",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Afrobeats Playbook - Davido & Wizkid</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      background-color: #fafafa;
      margin: 0;
      padding: 0;
    }
    .cover {
      background: linear-gradient(135deg, #1e1b4b 0%, #31102f 50%, #111827 100%);
      color: #ffffff;
      padding: 100px 40px;
      text-align: center;
      border-bottom: 8px solid #f43f5e;
    }
    .cover h1 {
      font-size: 3.5rem;
      margin: 0;
      font-weight: 900;
      letter-spacing: -0.05em;
      text-transform: uppercase;
      background: linear-gradient(to right, #f43f5e, #fb7185, #f43f5e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cover p.author {
      font-size: 1.5rem;
      margin: 20px 0 0 0;
      font-weight: 500;
      color: #e2e8f0;
    }
    .cover p.badge {
      display: inline-block;
      background: rgba(244, 63, 94, 0.2);
      border: 1px solid #f43f5e;
      color: #fb7185;
      font-family: monospace;
      font-size: 0.8rem;
      padding: 5px 15px;
      border-radius: 9999px;
      margin-top: 30px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .container {
      max-width: 800px;
      margin: 60px auto;
      padding: 0 30px;
    }
    .intro {
      font-size: 1.25rem;
      color: #4b5563;
      border-left: 4px solid #f43f5e;
      padding-left: 20px;
      margin-bottom: 50px;
      font-style: italic;
    }
    h2 {
      font-size: 2rem;
      margin-top: 50px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
    }
    h3 {
      font-size: 1.4rem;
      color: #1e293b;
      margin-top: 30px;
    }
    p {
      margin-bottom: 20px;
      color: #334155;
    }
    .quote-box {
      background-color: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 25px;
      border-radius: 0 12px 12px 0;
      margin: 40px 0;
    }
    .quote-box p {
      margin: 0;
      font-weight: 600;
      color: #1e293b;
    }
    .quote-box span {
      display: block;
      margin-top: 10px;
      font-size: 0.85rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .framework-list {
      background-color: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 25px 25px 25px 45px;
      margin: 40px 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .framework-list li {
      margin-bottom: 15px;
      color: #334155;
    }
    .framework-list li strong {
      color: #0f172a;
    }
    footer {
      text-align: center;
      padding: 40px 0;
      border-top: 1px solid #e2e8f0;
      margin-top: 80px;
      color: #64748b;
      font-size: 0.9rem;
    }
    .print-btn {
      display: block;
      width: fit-content;
      margin: 40px auto 0 auto;
      background-color: #f43f5e;
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .print-btn:hover {
      background-color: #e11d48;
    }
    @media print {
      .print-btn { display: none; }
      body { background-color: #fff; }
      .container { max-width: 100%; margin: 0; padding: 0; }
    }
  </style>
</head>
<body>

  <div class="cover">
    <p class="badge">CHIP NG Premium Digital Store</p>
    <h1>The Afrobeats Playbook</h1>
    <p class="author">By Davido & Wizkid</p>
  </div>

  <div class="container">
    <div class="intro">
      "Afrobeats is no longer a regional rhythm; it is a global movement. To take our local sound from the streets of Lagos to the main stages of London, Paris, and New York, we had to combine authentic cultural storytelling with world-class sonic production and direct fan ownership."
    </div>

    <h2>Chapter 1: The Sonic Foundations</h2>
    <p>
      At the heart of any successful Afrobeats record is the groove. Unlike Western pop, which often builds on simple four-on-the-floor kick drums or rigid hip-hop trap patterns, Afrobeats relies on complex polyrhythms. It is a modern fusion of classic Fuji drums, Highlife percussion, and syncopated snare placements.
    </p>
    <p>
      When producing a hit record, the percussion must leave "pocket space" for the vocals. The bassline shouldn't clash with the 808s; instead, it should roll smoothly underneath the kick. To capture global ears, we introduce melodic synth pads and smooth saxophone or guitar riffs that immediately create a warm, summer-like atmospheric feel.
    </p>

    <div class="quote-box">
      <p>"Do not overcomplicate the loop. If the street can't dance to the baseline instrument within three seconds, you've lost the dancefloor."</p>
      <span>— Wizkid</span>
    </div>

    <h2>Chapter 2: Songwriting for Global Appeal</h2>
    <p>
      Global hitmaking is about balance. You must remain authentically African while remaining accessible to listeners in Paris, Tokyo, and Los Angeles. To achieve this, our songwriting blends English, Pidgin English, Yoruba, and Igbo catchphrases.
    </p>
    <p>
      A great Afrobeats track relies on repetition and emotional resonance. The hook should be simple enough for a non-English speaker to hum or mimic, while the verses tell a relatable story of love, success, celebration, or triumph over adversity.
    </p>

    <ul class="framework-list">
      <li><strong>The Mimicry Hook:</strong> Build the chorus around easy-to-sing syllables (e.g., "Fall", "Ye", "Soco") that bridge linguistic boundaries instantly.</li>
      <li><strong>Emotional Progression:</strong> Start with a mellow, intimate pre-chorus that builds tension, then release it into an upbeat, energetic chorus.</li>
      <li><strong>Atmospheric Vibe:</strong> Use vocal ad-libs and harmonies to create a lush, ambient soundscape that feels like a live celebration.</li>
    </ul>

    <h2>Chapter 3: Stage Mastery & Stadium Energy</h2>
    <p>
      You can have a million streams, but your long-term legacy is decided on the stage. Selling out arenas like the O2 or Madison Square Garden requires a high-energy live band, pristine vocal control, and direct crowd interaction.
    </p>
    <p>
      A performer must command the stage. Stagger your performance: start with high-energy club anthems to capture attention, transition to a smooth, mid-tempo section where you talk directly to the fans, and close with your biggest historic records accompanied by full acoustic instrumentation.
    </p>

    <div class="quote-box">
      <p>"We run. We jump. We sweat. If the audience sees that you are giving 150% of your energy, they will return it tenfold. The band must play tight, and the horns must soar."</p>
      <span>— Davido</span>
    </div>

    <h2>Chapter 4: The Music Business & Independent Control</h2>
    <p>
      Monetizing your sound globally requires strict business acumen. Many African artists sign away their masters early in their careers. The modern playbook recommends a joint-venture structure where you retain ownership of your sound recordings while partnering with major labels for global marketing and distribution.
    </p>
    <p>
      Build an in-house team consisting of an experienced entertainment lawyer, a trusted brand manager, and a digital marketing specialist. Leverage your NFC-enabled bio links (like CHIP NG) to sell merchandise, concert tickets, and exclusive digital experiences directly to your core fanbase, avoiding middleman commissions.
    </p>

    <button class="print-btn" onclick="window.print()">Print or Save as PDF</button>
  </div>

  <footer>
    <p>© 2026 CHIP NG Premium Publishing. All rights reserved. Powered by CHIP NG.</p>
  </footer>

</body>
</html>`
  },
  {
    id: "2",
    title: "Industrializing Africa",
    author: "Aliko Dangote",
    category: "BUSINESS LEADERSHIP",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Industrializing Africa - Aliko Dangote</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      background-color: #fafafa;
      margin: 0;
      padding: 0;
    }
    .cover {
      background: linear-gradient(135deg, #083344 0%, #115e59 50%, #0f172a 100%);
      color: #ffffff;
      padding: 100px 40px;
      text-align: center;
      border-bottom: 8px solid #3b82f6;
    }
    .cover h1 {
      font-size: 3.5rem;
      margin: 0;
      font-weight: 900;
      letter-spacing: -0.05em;
      text-transform: uppercase;
      background: linear-gradient(to right, #06b6d4, #3b82f6, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cover p.author {
      font-size: 1.5rem;
      margin: 20px 0 0 0;
      font-weight: 500;
      color: #e2e8f0;
    }
    .cover p.badge {
      display: inline-block;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid #3b82f6;
      color: #60a5fa;
      font-family: monospace;
      font-size: 0.8rem;
      padding: 5px 15px;
      border-radius: 9999px;
      margin-top: 30px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .container {
      max-width: 800px;
      margin: 60px auto;
      padding: 0 30px;
    }
    .intro {
      font-size: 1.25rem;
      color: #4b5563;
      border-left: 4px solid #3b82f6;
      padding-left: 20px;
      margin-bottom: 50px;
      font-style: italic;
    }
    h2 {
      font-size: 2rem;
      margin-top: 50px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
    }
    p {
      margin-bottom: 20px;
      color: #334155;
    }
    .quote-box {
      background-color: #f8fafc;
      border-left: 4px solid #0d9488;
      padding: 25px;
      border-radius: 0 12px 12px 0;
      margin: 40px 0;
    }
    .quote-box p {
      margin: 0;
      font-weight: 600;
      color: #1e293b;
    }
    .quote-box span {
      display: block;
      margin-top: 10px;
      font-size: 0.85rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .framework-list {
      background-color: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 25px 25px 25px 45px;
      margin: 40px 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .framework-list li {
      margin-bottom: 15px;
      color: #334155;
    }
    .framework-list li strong {
      color: #0f172a;
    }
    footer {
      text-align: center;
      padding: 40px 0;
      border-top: 1px solid #e2e8f0;
      margin-top: 80px;
      color: #64748b;
      font-size: 0.9rem;
    }
    .print-btn {
      display: block;
      width: fit-content;
      margin: 40px auto 0 auto;
      background-color: #3b82f6;
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .print-btn:hover {
      background-color: #2563eb;
    }
    @media print {
      .print-btn { display: none; }
      body { background-color: #fff; }
      .container { max-width: 100%; margin: 0; padding: 0; }
    }
  </style>
</head>
<body>

  <div class="cover">
    <p class="badge">CHIP NG Premium Digital Store</p>
    <h1>Industrializing Africa</h1>
    <p class="author">By Aliko Dangote</p>
  </div>

  <div class="container">
    <div class="intro">
      "True economic freedom for Africa will not come from importing finished goods. It comes from local value addition, backward integration, and building capital-intensive heavy industries that feed, house, and power the continent."
    </div>

    <h2>Chapter 1: The Backward Integration Strategy</h2>
    <p>
      Backward integration is the practice of controlling your supply chain from raw material extraction to final delivery. In the early days of Dangote Group, we imported finished bulk commodities like sugar, flour, and cement. However, we realized that relying on imports subjected us to foreign exchange volatility and global port bottlenecks.
    </p>
    <p>
      To build a self-sustaining industrial empire, we transitioned from trading to manufacturing. This meant investing heavily in local processing plants, limestone quarries, agricultural plantations, and deep-water ports. By raw material sourcing locally, we insulated our margins and generated hundreds of thousands of domestic jobs.
    </p>

    <div class="quote-box">
      <p>"Nothing is as dangerous as importing what you can easily produce locally. Backward integration is not just a business strategy; it is a national duty."</p>
      <span>— Aliko Dangote</span>
    </div>

    <h2>Chapter 2: Logistics & Continental Scale</h2>
    <p>
      In Africa, logistics is the ultimate differentiator. The lack of reliable road, rail, and energy infrastructure can quickly destroy a factory's profitability. To succeed on a continental scale, you must build your own logistics capabilities.
    </p>
    <p>
      We solved this problem by establishing a massive private fleet of over 10,000 heavy-duty trucks, building our own power plants, and designing custom regional distribution networks. Whether you are moving cement, sugar, or fertilizer, your supply chain must be completely resilient to external failures.
    </p>

    <ul class="framework-list">
      <li><strong>Energy Independence:</strong> Never rely entirely on the national grid. Build custom gas-fired turbines or biomass generators directly at your plant.</li>
      <li><strong>Vertical Fleet Management:</strong> Control your own distribution. Having private transport assets guarantees that your products reach markets first.</li>
      <li><strong>Direct Distribution Channels:</strong> Sell directly to certified distributors and merchants to optimize delivery margins and cut out middlemen.</li>
    </ul>

    <h2>Chapter 3: Risk Mitigation & Mega Projects</h2>
    <p>
      Executing multi-billion dollar mega-projects (such as the Lekki Refinery or massive cement plants in multiple countries) requires extraordinary patience and financial structuring.
    </p>
    <p>
      Always raise long-term capital with matching tenors, preferably in local currencies when possible to avoid exchange-rate shocks. Establish strong relations with developmental financial institutions, and ensure your projects align directly with the host nation's primary industrial growth goals.
    </p>

    <button class="print-btn" onclick="window.print()">Print or Save as PDF</button>
  </div>

  <footer>
    <p>© 2026 CHIP NG Premium Publishing. All rights reserved. Powered by CHIP NG.</p>
  </footer>

</body>
</html>`
  },
  {
    id: "3",
    title: "Street-Smart Marketing",
    author: "Olamide (YBNL)",
    category: "CREATIVE STRATEGY",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Street-Smart Marketing - Olamide (YBNL)</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      background-color: #fafafa;
      margin: 0;
      padding: 0;
    }
    .cover {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%);
      color: #ffffff;
      padding: 100px 40px;
      text-align: center;
      border-bottom: 8px solid #10b981;
    }
    .cover h1 {
      font-size: 3.5rem;
      margin: 0;
      font-weight: 900;
      letter-spacing: -0.05em;
      text-transform: uppercase;
      background: linear-gradient(to right, #10b981, #34d399, #10b981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cover p.author {
      font-size: 1.5rem;
      margin: 20px 0 0 0;
      font-weight: 500;
      color: #e2e8f0;
    }
    .cover p.badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
      color: #34d399;
      font-family: monospace;
      font-size: 0.8rem;
      padding: 5px 15px;
      border-radius: 9999px;
      margin-top: 30px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .container {
      max-width: 800px;
      margin: 60px auto;
      padding: 0 30px;
    }
    .intro {
      font-size: 1.25rem;
      color: #4b5563;
      border-left: 4px solid #10b981;
      padding-left: 20px;
      margin-bottom: 50px;
      font-style: italic;
    }
    h2 {
      font-size: 2rem;
      margin-top: 50px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
    }
    p {
      margin-bottom: 20px;
      color: #334155;
    }
    .quote-box {
      background-color: #f8fafc;
      border-left: 4px solid #10b981;
      padding: 25px;
      border-radius: 0 12px 12px 0;
      margin: 40px 0;
    }
    .quote-box p {
      margin: 0;
      font-weight: 600;
      color: #1e293b;
    }
    .quote-box span {
      display: block;
      margin-top: 10px;
      font-size: 0.85rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .framework-list {
      background-color: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 25px 25px 25px 45px;
      margin: 40px 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .framework-list li {
      margin-bottom: 15px;
      color: #334155;
    }
    .framework-list li strong {
      color: #0f172a;
    }
    footer {
      text-align: center;
      padding: 40px 0;
      border-top: 1px solid #e2e8f0;
      margin-top: 80px;
      color: #64748b;
      font-size: 0.9rem;
    }
    .print-btn {
      display: block;
      width: fit-content;
      margin: 40px auto 0 auto;
      background-color: #10b981;
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .print-btn:hover {
      background-color: #059669;
    }
    @media print {
      .print-btn { display: none; }
      body { background-color: #fff; }
      .container { max-width: 100%; margin: 0; padding: 0; }
    }
  </style>
</head>
<body>

  <div class="cover">
    <p class="badge">CHIP NG Premium Digital Store</p>
    <h1>Street-Smart Marketing</h1>
    <p class="author">By Olamide (YBNL)</p>
  </div>

  <div class="container">
    <div class="intro">
      "You don't need a multi-million dollar marketing agency to build an empire. You need street credibility, absolute authenticity, grassroots viral hooks, and a relentless focus on discovering and empowering the next generation of raw talent."
    </div>

    <h2>Chapter 1: The Core of Street Credibility</h2>
    <p>
      In emerging economies, buying decisions are driven by communal trust and authentic connection. Traditional billboard and television advertisements feel distant and corporate. To truly win, your brand must speak the language of the street.
    </p>
    <p>
      At YBNL, we built our brand from the ground up by staying deeply connected to the street demographic. We used slang, local stories, and street-centric videos. This approach created a dedicated cult following that spread our message organically, turning fans into active ambassadors.
    </p>

    <div class="quote-box">
      <p>"The street is smart. They can spot a corporate fake in a second. Stay authentic, stay humble, and talk to people, not down to them."</p>
      <span>— Olamide (YBNL)</span>
    </div>

    <h2>Chapter 2: The Independent Record Label Playbook</h2>
    <p>
      Discovering talent is only 20% of the game; the remaining 80% is grooming, positioning, and marketing. Our label blueprint relies on a collaborative partnership model rather than standard exploitative contracts.
    </p>
    <p>
      When we sign artists (such as Fireboy DML or Asake), we give them artistic freedom, invest heavily in high-frequency content production, and teach them the business of songwriting and copyright control. This mentorship builds deep loyalty and results in hit records that consistently capture global markets.
    </p>

    <ul class="framework-list">
      <li><strong>Slang and Catchphrase Seeding:</strong> Create memorable slangs that integrate into daily vernacular, keeping your brand top-of-mind.</li>
      <li><strong>Low-Cost Content Frequency:</strong> Release multiple viral short-form videos instead of putting all capital into one expensive official launch.</li>
      <li><strong>Grassroots Amplification:</strong> Leverage local DJs, barbershops, and community hubs to play your records first, building momentum.</li>
    </ul>

    <h2>Chapter 3: Turning Fans into Customers</h2>
    <p>
      A passionate fanbase is the ultimate asset. To monetize it without losing credibility, offer real value. This can include exclusive digital products, limited merchandise, intimate concert experiences, or helpful online guides.
    </p>
    <p>
      With digital storefront portals, you can bypass platform gatekeepers. Set up clean paths for fans to download your digital guides or courses directly from your bio link, keeping transactional friction to an absolute minimum.
    </p>

    <button class="print-btn" onclick="window.print()">Print or Save as PDF</button>
  </div>

  <footer>
    <p>© 2026 CHIP NG Premium Publishing. All rights reserved. Powered by CHIP NG.</p>
  </footer>

</body>
</html>`
  },
  {
    id: "4",
    title: "The Legacy Philanthropist",
    author: "Femi Otedola",
    category: "WEALTH & PHILANTHROPY",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Legacy Philanthropist - Femi Otedola</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      background-color: #fafafa;
      margin: 0;
      padding: 0;
    }
    .cover {
      background: linear-gradient(135deg, #3b0764 0%, #4c1d95 50%, #0f172a 100%);
      color: #ffffff;
      padding: 100px 40px;
      text-align: center;
      border-bottom: 8px solid #8b5cf6;
    }
    .cover h1 {
      font-size: 3.5rem;
      margin: 0;
      font-weight: 900;
      letter-spacing: -0.05em;
      text-transform: uppercase;
      background: linear-gradient(to right, #a78bfa, #8b5cf6, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cover p.author {
      font-size: 1.5rem;
      margin: 20px 0 0 0;
      font-weight: 500;
      color: #e2e8f0;
    }
    .cover p.badge {
      display: inline-block;
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid #8b5cf6;
      color: #c084fc;
      font-family: monospace;
      font-size: 0.8rem;
      padding: 5px 15px;
      border-radius: 9999px;
      margin-top: 30px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .container {
      max-width: 800px;
      margin: 60px auto;
      padding: 0 30px;
    }
    .intro {
      font-size: 1.25rem;
      color: #4b5563;
      border-left: 4px solid #8b5cf6;
      padding-left: 20px;
      margin-bottom: 50px;
      font-style: italic;
    }
    h2 {
      font-size: 2rem;
      margin-top: 50px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
    }
    p {
      margin-bottom: 20px;
      color: #334155;
    }
    .quote-box {
      background-color: #f8fafc;
      border-left: 4px solid #8b5cf6;
      padding: 25px;
      border-radius: 0 12px 12px 0;
      margin: 40px 0;
    }
    .quote-box p {
      margin: 0;
      font-weight: 600;
      color: #1e293b;
    }
    .quote-box span {
      display: block;
      margin-top: 10px;
      font-size: 0.85rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .framework-list {
      background-color: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 25px 25px 25px 45px;
      margin: 40px 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .framework-list li {
      margin-bottom: 15px;
      color: #334155;
    }
    .framework-list li strong {
      color: #0f172a;
    }
    footer {
      text-align: center;
      padding: 40px 0;
      border-top: 1px solid #e2e8f0;
      margin-top: 80px;
      color: #64748b;
      font-size: 0.9rem;
    }
    .print-btn {
      display: block;
      width: fit-content;
      margin: 40px auto 0 auto;
      background-color: #8b5cf6;
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .print-btn:hover {
      background-color: #7c3aed;
    }
    @media print {
      .print-btn { display: none; }
      body { background-color: #fff; }
      .container { max-width: 100%; margin: 0; padding: 0; }
    }
  </style>
</head>
<body>

  <div class="cover">
    <p class="badge">CHIP NG Premium Digital Store</p>
    <h1>The Legacy Philanthropist</h1>
    <p class="author">By Femi Otedola</p>
  </div>

  <div class="container">
    <div class="intro">
      "Wealth is not measured by the quantity of assets you accumulate; it is measured by the degree of positive impact you have on human lives, and the legacy of social growth you leave behind."
    </div>

    <h2>Chapter 1: Capital Allocation & Power Infrastructure</h2>
    <p>
      In business, timing is everything. Understanding when to pivot from shipping and downstream oil logistics to primary power generation (such as our strategic investment in Geregu Power PLC) requires deep market foresight and strong capital allocation discipline.
    </p>
    <p>
      Always look for sector inefficiencies in essential infrastructure. When a country lacks stable electricity, clean water, or transport logistics, investing in those critical foundation layers guarantees long-term economic dividends and aligns your company's growth with national development.
    </p>

    <div class="quote-box">
      <p>"True wealth creation requires patience. Focus on critical sectors that form the foundation of national life."</p>
      <span>— Femi Otedola</span>
    </div>

    <h2>Chapter 2: The Art of Impact Philanthropy</h2>
    <p>
      Giving shouldn't be passive or purely emotional. High-impact philanthropy requires the same level of strategic rigor, accountability, and project tracking as standard corporate investing.
    </p>
    <p>
      When we endow multi-billion Naira funds to educational or healthcare institutions, we establish independent boards of trustees and clear key performance metrics. This ensures that every Single Naira spent goes directly to improving human lives and creating durable institutional capacity.
    </p>

    <ul class="framework-list">
      <li><strong>Institutional Endowment:</strong> Set up long-term trusts to fund scholarships, research, and healthcare infrastructure sustainably.</li>
      <li><strong>Emergency Response Directives:</strong> Maintain dry powder/liquid funds to immediately respond to national health crises or natural disasters.</li>
      <li><strong>Board Governance:</strong> Ensure independent oversight and transparent audits of all philanthropic fund expenditures.</li>
    </ul>

    <h2>Chapter 3: Boardroom Diplomacy & Trust</h2>
    <p>
      In high-stakes investing, your reputation is your ultimate currency. Build relationships on trust, absolute integrity, and a win-win philosophy. This makes you the preferred partner when major corporate turnarounds or state privatizations arise.
    </p>

    <button class="print-btn" onclick="window.print()">Print or Save as PDF</button>
  </div>

  <footer>
    <p>© 2026 CHIP NG Premium Publishing. All rights reserved. Powered by CHIP NG.</p>
  </footer>

</body>
</html>`
  }
];
