const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
        await page.goto('http://localhost:3000/locataire/login', {waitUntil:'networkidle'});
        
        await page.fill('input[name="identifier"]', '+2250102030405'); // Assuming identifier is the name
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        
        await page.waitForNavigation({waitUntil: 'networkidle'}).catch(() => console.log('Navigation took too long but proceeding'));
        console.log("Logged in!");
        
        const locataireNavCount = await page.locator('aside a[href^="/locataire"]').count();
        console.log("Nav links found:", locataireNavCount);
        
        const href = await page.locator('aside a').filter({ hasText: 'Mon bail' }).first().getAttribute('href');
        console.log("Href for Mon bail:", href);
        
        // Let's try to click it
        console.log("Clicking Mon Bail...");
        const response = await Promise.all([
          page.waitForNavigation({waitUntil: 'networkidle'}).catch(() => null),
          page.locator('aside a').filter({ hasText: 'Mon bail' }).first().click({force: true}).catch(e => console.log(e.message))
        ]);
        console.log("Response after click:", page.url());

    } catch(e) {
        console.error("Test failed", e);
    }
    await browser.close();
})();
