import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Use the exact local path provided in the user information and prompt
const userDataDir = 'C:\\Users\\adamw\\.gemini\\antigravity\\brain\\2adda517-e2d5-4261-847f-28d4ccbc280f';

async function verifyMobileLayout() {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE dimensions
        isMobile: true
    });
    const page = await context.newPage();

    console.log('Navigating to app (Mobile View on port 3000)...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000); // Wait for load

    // Screenshot 1: Sidebar Hidden
    console.log('Taking screenshot: Sidebar Hidden');
    await page.screenshot({ path: path.join(userDataDir, 'mobile-sidebar-hidden.png') });

    // Check if hamburger menu exists
    const menuBtn = await page.$('button:has(svg.lucide-menu)');
    if (menuBtn) {
        console.log('Hamburger menu found.');
        // Click it
        await menuBtn.click();
        await page.waitForTimeout(500); // Wait for animation

        // Screenshot 2: Sidebar Open
        console.log('Taking screenshot: Sidebar Open');
        await page.screenshot({ path: path.join(userDataDir, 'mobile-sidebar-open.png') });
    } else {
        console.error('Hamburger menu NOT found!');
    }

    await browser.close();
}

verifyMobileLayout();
