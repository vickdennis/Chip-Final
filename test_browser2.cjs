const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000/dashboard');
  
  await page.evaluate(() => {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: {
        user: {
          id: 'test-user',
          email: 'test@example.com'
        }
      }
    }));
  });
  
  await page.goto('http://localhost:3000/dashboard');
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
