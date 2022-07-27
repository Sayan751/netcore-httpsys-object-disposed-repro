import { chromium, Page } from 'playwright';

const hostName = 'gh.repro.sp.dev';
export const baseUrl = `https://${hostName}:7048/`;
export async function runTest(testFunction: (page: Page) => Promise<void>, path: string) {
    const browser = await chromium.launch({ channel: 'chrome', headless: false, downloadsPath: '' });
    const context = await browser.newContext({ ignoreHTTPSErrors: true, acceptDownloads: true });
    const page = await context.newPage();
    await page.goto(baseUrl + path, { waitUntil: 'networkidle' });
    await page.setViewportSize({ height: 1080, width: 1920 });

    await testFunction(page);

    await page.close();
    await context.close();
    await browser.close();
}
