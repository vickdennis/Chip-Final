const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERR:', err.message));
  
  await page.goto('http://localhost:3000/someusername');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const content = await page.content();
  if (content.includes('Loading...')) {
    console.log('Profile is stuck on Loading...');
  } else {
    console.log('Profile loaded');
    if (content.includes('User not found')) {
       console.log('User not found message displayed');
    }
  }
  
  await browser.close();
})();
