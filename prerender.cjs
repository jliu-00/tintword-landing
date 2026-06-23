const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

(async () => {
  console.log('Starting prerender server...');
  const server = spawn('npm', ['run', 'preview']);
  
  // Wait a bit for the server to spin up
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Launching puppeteer...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set a large viewport
  await page.setViewport({ width: 1200, height: 1000 });
  
  console.log('Navigating to http://localhost:4173...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  
  // Wait extra time for Framer Motion animations to settle
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const html = await page.content();
  
  console.log('Saving prerendered HTML to dist/index.html...');
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  fs.writeFileSync(indexPath, html);
  
  await browser.close();
  server.kill();
  console.log('Prerender complete.');
  process.exit(0);
})();
