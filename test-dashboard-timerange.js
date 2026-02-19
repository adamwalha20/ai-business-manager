
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    console.log('🚀 Starting Dashboard Time Range Test...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        console.log('📍 Navigating to Dashboard...');
        await page.goto('http://localhost:3000');

        // Wait for the app to load
        await page.waitForSelector('#view-weekly');

        console.log('✅ Found Weekly/Monthly buttons.');

        // 1. Test Weekly (Default)
        const labelWeekly = await page.textContent('span.capitalize');
        console.log(`📊 Current View: ${labelWeekly}`);
        if (!labelWeekly.includes('7')) {
            throw new Error('Initial view should be 7 days');
        }

        // 2. Click Monthly
        console.log('🖱️ Clicking Monthly button...');
        await page.click('#view-monthly');

        // Wait for state change (the label should update)
        await page.waitForFunction(() => document.querySelector('span.capitalize').textContent.includes('30'));

        const labelMonthly = await page.textContent('span.capitalize');
        console.log(`📊 Updated View: ${labelMonthly}`);
        if (!labelMonthly.includes('30')) {
            throw new Error('Monthly view should show 30 days');
        }
        console.log('✅ Monthly view toggle works!');

        // 3. Click Weekly back
        console.log('🖱️ Clicking Weekly button...');
        await page.click('#view-weekly');
        await page.waitForFunction(() => document.querySelector('span.capitalize').textContent.includes('7'));

        const labelFinal = await page.textContent('span.capitalize');
        console.log(`📊 Final View: ${labelFinal}`);
        if (!labelFinal.includes('7')) {
            throw new Error('Should toggle back to 7 days');
        }
        console.log('✅ Toggle back to Weekly works!');

        console.log('🎉 All Time Range tests passed!');

        // Take a screenshot of the Monthly view for the walkthrough
        await page.click('#view-monthly');
        const screenshotPath = path.resolve(process.cwd(), 'monthly-dashboard.png');
        await page.screenshot({ path: screenshotPath });
        console.log('📸 Monthly view screenshot saved:', screenshotPath);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
