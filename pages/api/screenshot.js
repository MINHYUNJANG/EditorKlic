import { launchBrowser, launchFirefoxBrowser } from '../../lib/playwright-helper.js';

function isSafeUrl(url) {
  try {
    const { hostname, protocol } = new URL(url);
    if (!['http:', 'https:'].includes(protocol)) return false;
    if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0|::1)/.test(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

const BROWSER_CONFIGS = {
  chrome:   { engine: 'chromium', viewport: { width: 1920, height: 1080 } },
  edge:     { engine: 'chromium', viewport: { width: 1920, height: 1080 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0' },
  whale:    { engine: 'chromium', viewport: { width: 1920, height: 1080 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Whale/3.26.224.18 Safari/537.36' },
  firefox:  { engine: 'firefox',  viewport: { width: 1920, height: 1080 } },
  safari:   { engine: 'chromium', viewport: { width: 1920, height: 1080 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15' },
  ios:      { engine: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  android:  { engine: 'chromium', viewport: { width: 412, height: 915 }, isMobile: true, userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });
  let browser;
  try {
    const { url, browser: browserId } = req.body;
    if (!url || !browserId) return res.status(400).json({ detail: 'url과 browser는 필수입니다.' });
    if (!isSafeUrl(url)) return res.status(400).json({ detail: '허용되지 않는 URL입니다.' });

    const config = BROWSER_CONFIGS[browserId];
    if (!config) return res.status(400).json({ detail: `지원하지 않는 브라우저: ${browserId}` });

    if (config.engine === 'firefox') {
      browser = await launchFirefoxBrowser();
    } else {
      browser = await launchBrowser();
    }

    const contextOptions = { viewport: config.viewport };
    if (config.userAgent) contextOptions.userAgent = config.userAgent;
    if (config.isMobile) contextOptions.isMobile = true;

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: config.viewport.width, height: fullHeight });
    await page.waitForTimeout(300);
    const buffer = await page.screenshot({ type: 'png', fullPage: false });

    res.json({ image: buffer.toString('base64') });
  } catch (e) {
    res.status(500).json({ detail: e.message });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
