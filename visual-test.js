
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log('Navigating to app...');
    await page.goto('http://localhost:3000');

    // Verify title
    const title = await page.title();
    console.log('Page Title:', title);

    // Verify theme color
    const bodyColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log('Body Background Color:', bodyColor);

    console.log('Taking screenshot...');
    // Save to current directory for simplicity
    const screenshotPath = path.resolve(process.cwd(), 'dashboard-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log('Screenshot saved to:', screenshotPath);

    await browser.close();
})();
