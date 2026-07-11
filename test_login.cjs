const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000/login');
  
  // Wait for login form
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'vickthor.dennis@gmail.com');
  await page.type('input[type="password"]', 'password123'); // assuming test password
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await new Promise(r => setTimeout(r, 4000));
  
  // Check if we are on dashboard
  console.log('Current URL:', page.url());
  
  await browser.close();
})();
