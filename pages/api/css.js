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

// JSON API로 CSS 검사 결과 취득 (여러 헤더 조합 시도)
async function fetchCssJson(url) {
  const apiUrl = `https://jigsaw.w3.org/css-validator/validator?uri=${encodeURIComponent(url)}&output=json&warning=1&lang=ko`;
  const attempts = [
    {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'Referer': 'https://jigsaw.w3.org/css-validator/',
      'Cache-Control': 'no-cache',
    },
    {
      'User-Agent': 'W3C_CSS_Validator_JFouffa/2.0',
      'Accept': 'application/json',
    },
  ];

  for (const headers of attempts) {
    try {
      const resp = await fetch(apiUrl, { headers, signal: AbortSignal.timeout(20000) });
      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
    } catch { /* 다음 시도 */ }
  }
  return null;
}


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });

  let browser;
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ detail: 'url은 필수입니다.' });
    if (!isSafeUrl(url)) return res.status(400).json({ detail: '허용되지 않는 URL입니다.' });

    // ── 1) JSON 결과 취득 ──────────────────────────────────────
    const data = await fetchCssJson(url);

    let errors = [], warnings = [], errorCount = 0, warningCount = 0;

    if (data) {
      const cssvalidation = data.cssvalidation ?? {};
      const result = cssvalidation.result ?? {};
      errorCount = result.errorcount ?? 0;
      warningCount = result.warningcount ?? 0;
      errors = cssvalidation.errors ?? [];
      warnings = cssvalidation.warnings ?? [];
      if (!Array.isArray(errors)) errors = errors ? [errors] : [];
      if (!Array.isArray(warnings)) warnings = warnings ? [warnings] : [];
    }

    // ── 2) W3C CSS validator 결과 페이지 직접 캡처 ──
    let cssScreenshot = null;
    if (errorCount === 0) {
      const validatorUrl = `https://jigsaw.w3.org/css-validator/validator?uri=${encodeURIComponent(url)}&profile=css3svg&usermedium=all&warning=1&vextwarning=&lang=ko`;
      try {
        browser = await launchBrowser();
        const context = await browser.newContext({
          viewport: { width: 1280, height: 900 },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        });
        const page = await context.newPage();
        await page.goto(validatorUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1500);
        const contentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.setViewportSize({ width: 1280, height: Math.min(contentHeight, 2400) });
        await page.waitForTimeout(300);
        const buffer = await page.screenshot({ type: 'png', fullPage: false });
        cssScreenshot = buffer.toString('base64');
      } catch {
        // 캡처 실패해도 결과는 반환
      } finally {
        if (browser) await browser.close().catch(() => {});
        browser = null;
      }
    }

    res.json({ errors, warnings, errorCount, warningCount, cssScreenshot });
  } catch (e) {
    if (browser) await browser.close().catch(() => {});
    res.status(500).json({ detail: e.message });
  }
}
