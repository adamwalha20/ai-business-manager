
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set viewport to a reasonable size
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('Navigating to app...');
    await page.goto('http://localhost:3000');

    // Helper to take screenshot
    const takeScreenshot = async (name) => {
        const screenshotPath = path.resolve(__dirname, `screenshot-${name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Captured: ${name}`);
    };

    // 1. Dashboard
    console.log('Verifying Dashboard...');
    // Wait for dashboard content to load
    await page.waitForSelector('text=Total Revenue');
    await takeScreenshot('dashboard');

    // 2. Orders
    console.log('Navigating to Orders...');
    await page.click('button:has-text("Orders")');
    // Wait for Orders table or loading to finish
    await page.waitForTimeout(1000); // Allow transition
    // Try waiting for specific content if possible, else timeout is safer for dynamic content
    try {
        await page.waitForSelector('text=Orders', { timeout: 5000 });
        await page.waitForSelector('table', { timeout: 5000 });
    } catch (e) { console.log('Timeout waiting for Orders content'); }
    await takeScreenshot('orders');

    // 3. Messages
    console.log('Navigating to Messages...');
    await page.click('button:has-text("Messages")');
    await page.waitForTimeout(1000);
    try {
        await page.waitForSelector('text=Messages', { timeout: 5000 });
    } catch (e) { console.log('Timeout waiting for Messages content'); }
    await takeScreenshot('messages');

    // 4. Products
    console.log('Navigating to Products...');
    await page.click('button:has-text("Products & Stock")');
    await page.waitForTimeout(1000); // Wait for data fetch
    try {
        await page.waitForSelector('text=Products & Stock', { timeout: 5000 });
        // Wait for at least one product card or empty state
        await page.waitForSelector('.grid', { timeout: 5000 });
    } catch (e) {
        console.log('Timeout waiting for Products content');
    }
    await takeScreenshot('products');

    // 5. Settings
    console.log('Navigating to Settings...');
    await page.click('button:has-text("AI Settings")');
    await page.waitForTimeout(500);
    try {
        await page.waitForSelector('text=AI Configuration', { timeout: 5000 });
    } catch (e) { console.log('Timeout waiting for Settings content'); }
    await takeScreenshot('settings');

    await browser.close();
    console.log('All screenshots captured.');
})();
