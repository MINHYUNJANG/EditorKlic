import { launchBrowser } from '../../lib/playwright-helper.js';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });
  let browser;
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ detail: 'url은 필수입니다.' });
    if (!isSafeUrl(url)) return res.status(400).json({ detail: '허용되지 않는 URL입니다.' });

    const apiUrl = `https://jigsaw.w3.org/css-validator/validator?uri=${encodeURIComponent(url)}&output=json`;
    const apiResponse = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MarkupTool/1.0)' },
      signal: AbortSignal.timeout(30000),
    });
    if (!apiResponse.ok) return res.status(502).json({ detail: `CSS 검사기 응답 오류: ${apiResponse.status}` });

    const data = await apiResponse.json();
    const cssvalidation = data.cssvalidation ?? {};
    const result = cssvalidation.result ?? {};
    const errorCount = result.errorcount ?? 0;
    const warningCount = result.warningcount ?? 0;
    let errors = cssvalidation.errors ?? [];
    let warnings = cssvalidation.warnings ?? [];
    if (!Array.isArray(errors)) errors = errors ? [errors] : [];
    if (!Array.isArray(warnings)) warnings = warnings ? [warnings] : [];

    let cssScreenshot = null;
    try {
      const pageUrl = `https://jigsaw.w3.org/css-validator/validator?uri=${encodeURIComponent(url)}&lang=ko&warning=0`;
      browser = await launchBrowser();
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        ['#results ~ *', '.boxtitle', 'table.cssSource', '#footer', 'div.footer', '#parsedSection'].forEach(sel => {
          try { document.querySelectorAll(sel).forEach(el => el.remove()); } catch {}
        });
        const results = document.getElementById('results');
        if (results) {
          let next = results.nextElementSibling;
          while (next) {
            const target = next;
            next = next.nextElementSibling;
            target.remove();
          }
          ['#errors', '#warnings', '.error-list', '.warning-list', 'dl', 'table'].forEach(sel => {
            try { results.querySelectorAll(sel).forEach(el => el.remove()); } catch {}
          });
        }
      });
      const contentHeight = await page.evaluate(() => document.body.scrollHeight);
      await page.setViewportSize({ width: 1280, height: Math.min(contentHeight, 1200) });
      const buffer = await page.screenshot({ type: 'png', fullPage: false });
      cssScreenshot = buffer.toString('base64');
    } catch {
      // 캡처 실패해도 검사 결과는 반환
    } finally {
      if (browser) await browser.close().catch(() => {});
      browser = null;
    }

    res.json({ errors, warnings, errorCount, warningCount, cssScreenshot });
  } catch (e) {
    if (browser) await browser.close().catch(() => {});
    res.status(500).json({ detail: e.message });
  }
}
