import { assert } from 'chai';
import { Browser, BrowserContext, chromium, Page } from 'playwright';
import { baseUrl, runTest } from "./shared";

describe('Foo test', function () {
    const path = 'foo';
    it('navigation to page-one works', async function () {
        await runTest(async function (page) {
            const actual = await page.locator('h1').innerText();
            assert.strictEqual(actual, 'foo one');
        }, path);
    });

    it('navigation to page-two works', async function () {
        await runTest(async function (page) {
            await page.locator('a >> text="two"').click();
            const actual = await page.locator('h1').innerText();
            assert.strictEqual(actual, 'foo two');
        }, path);
    });

    it('cross-app navigation works', async function () {
        await runTest(async function (page) {
            await page.locator('a >> text="bar"').click();
            const actual = await page.locator('h1').innerText();
            assert.strictEqual(actual, 'bar one');
        }, path);
    });
});

describe('Foo test - alternative', function () {
    let browser: Browser;
    let context: BrowserContext;
    let page: Page;

    before(async function () {
        browser = await chromium.launch({ channel: 'chrome', headless: false, downloadsPath: '' });
        context = await browser.newContext({ ignoreHTTPSErrors: true, acceptDownloads: true });
    });

    beforeEach(async function () {
        await context.tracing.start({ screenshots: true, snapshots: true });
        page = await context.newPage();
        await page.goto(baseUrl + path, { waitUntil: 'networkidle' });
        await page.setViewportSize({ height: 1080, width: 1920 });
    });

    afterEach(async function () {
        await page.close();
    });

    after(async function () {
        // await context.close();
        await browser.close();
    })

    const path = 'foo';
    it('navigation to page-one works', async function () {
        const actual = await page.locator('h1').innerText();
        assert.strictEqual(actual, 'foo one');
    });

    it('navigation to page-two works', async function () {
        await page.locator('a >> text="two"').click();
        const actual = await page.locator('h1').innerText();
        assert.strictEqual(actual, 'foo two');
    });

    it('cross-app navigation works', async function () {
        await page.locator('a >> text="bar"').click();
        const actual = await page.locator('h1').innerText();
        assert.strictEqual(actual, 'bar one');
    });

    it('de translation works', async function () {
        await page.locator('a >> text="de"').click();
        let actual = await page.locator('h1').innerText();
        assert.strictEqual(actual, 'foo eins');

        await page.locator('a >> text="two"').click();
        actual = await page.locator('h1').innerText();
        assert.strictEqual(actual, 'foo zwei');
    });
});
