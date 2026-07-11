const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000/login');
  
  // Switch to signup
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const signupTab = btns.find(b => b.innerText.toLowerCase().includes('create account'));
    if (signupTab) signupTab.click();
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  const testEmail = `test_${Date.now()}@example.com`;
  await page.type('input[type="email"]', testEmail);
  await page.type('input[placeholder="Jane Doe"]', 'Jane Doe');
  await page.type('input[type="password"]', 'password123');
  
  // Submit
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.innerText.toLowerCase().includes('create account') && b.type === 'submit');
    if (submitBtn) submitBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Try to login now
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginTab = btns.find(b => b.innerText.toLowerCase() === 'login');
    if (loginTab) loginTab.click();
  });
  await new Promise(r => setTimeout(r, 500));
  
  // clear email and password
  await page.evaluate(() => { document.querySelector('input[type="email"]').value = ''; document.querySelector('input[type="password"]').value = ''; });
  
  await page.type('input[type="email"]', testEmail);
  await page.type('input[type="password"]', 'password123');
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.innerText.toLowerCase().includes('sign in'));
    if (submitBtn) submitBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Current URL:', page.url());
  
  const content = await page.content();
  if (content.includes('Bio Management')) {
    console.log('Dashboard loaded correctly!');
  } else if (content.includes('Loading...')) {
    console.log('Stuck on loading');
  } else {
    console.log('Something else loaded');
  }
  
  await browser.close();
})();
