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

    // Playwright 브라우저로 CSS 검사기 접근 (서버 IP 차단 우회)
    browser = await launchBrowser();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    });

    // ── 1) JSON 결과 취득 ──────────────────────────────────────
    const jsonUrl = `https://jigsaw.w3.org/css-validator/validator?uri=${encodeURIComponent(url)}&output=json&warning=1&lang=ko`;
    const jsonPage = await context.newPage();
    const jsonResp = await jsonPage.goto(jsonUrl, { waitUntil: 'load', timeout: 25000 });

    let errors = [], warnings = [], errorCount = 0, warningCount = 0;

    if (jsonResp && jsonResp.ok()) {
      try {
        const raw = await jsonResp.text();
        const data = JSON.parse(raw);
        const cssvalidation = data.cssvalidation ?? {};
        const result = cssvalidation.result ?? {};
        errorCount = result.errorcount ?? 0;
        warningCount = result.warningcount ?? 0;
        errors = cssvalidation.errors ?? [];
        warnings = cssvalidation.warnings ?? [];
        if (!Array.isArray(errors)) errors = errors ? [errors] : [];
        if (!Array.isArray(warnings)) warnings = warnings ? [warnings] : [];
      } catch {
        // JSON 파싱 실패 시 빈 결과로 계속 진행
      }
    }

    // ── 2) 오류 없을 때만 증적 스크린샷 캡처 ──────────────────
    let cssScreenshot = null;
    if (errorCount === 0) {
      try {
        const screenshotPage = await context.newPage();
        const pageUrl = `https://jigsaw.w3.org/css-validator/validator?uri=${encodeURIComponent(url)}&lang=ko&warning=0`;
        await screenshotPage.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await screenshotPage.waitForTimeout(500);
        await screenshotPage.evaluate(() => {
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
        const contentHeight = await screenshotPage.evaluate(() => document.body.scrollHeight);
        await screenshotPage.setViewportSize({ width: 1280, height: Math.min(contentHeight, 1200) });
        const buffer = await screenshotPage.screenshot({ type: 'png', fullPage: false });
        cssScreenshot = buffer.toString('base64');
      } catch {
        // 스크린샷 실패해도 결과는 반환
      }
    }

    res.json({ errors, warnings, errorCount, warningCount, cssScreenshot });
  } catch (e) {
    res.status(500).json({ detail: e.message });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
