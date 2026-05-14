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

// W3C CSS 검사기 JSON API 호출 (여러 헤더 조합으로 시도)
async function fetchCssValidation(url) {
  const apiUrl = `https://jigsaw.w3.org/css-validator/validator?uri=${encodeURIComponent(url)}&output=json&warning=1&lang=ko`;

  const headerVariants = [
    {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      'Referer': 'https://jigsaw.w3.org/css-validator/',
    },
    {
      'User-Agent': 'W3C_CSS_Validator_JFouffa/2.0 (Jfouffa@w3.org) libwww-perl/5.64',
      'Accept': 'application/json',
    },
    {
      'User-Agent': 'Mozilla/5.0 (compatible; CSS-Validator/1.0)',
      'Accept': '*/*',
    },
  ];

  for (const headers of headerVariants) {
    try {
      const resp = await fetch(apiUrl, { headers, signal: AbortSignal.timeout(25000) });
      if (resp.ok) return await resp.json();
      if (resp.status === 403) continue; // 다음 헤더 조합 시도
      throw new Error(`CSS 검사기 응답 오류: ${resp.status}`);
    } catch (e) {
      if (e.message.includes('CSS 검사기')) throw e;
    }
  }

  // 모든 시도 실패 → 클라이언트 직접 접속 안내
  throw new Error('CSS_VALIDATOR_BLOCKED');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });
  let browser;
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ detail: 'url은 필수입니다.' });
    if (!isSafeUrl(url)) return res.status(400).json({ detail: '허용되지 않는 URL입니다.' });

    let errors = [], warnings = [], errorCount = 0, warningCount = 0;
    let cssBlocked = false;

    try {
      const data = await fetchCssValidation(url);
      const cssvalidation = data.cssvalidation ?? {};
      const result = cssvalidation.result ?? {};
      errorCount = result.errorcount ?? 0;
      warningCount = result.warningcount ?? 0;
      errors = cssvalidation.errors ?? [];
      warnings = cssvalidation.warnings ?? [];
      if (!Array.isArray(errors)) errors = errors ? [errors] : [];
      if (!Array.isArray(warnings)) warnings = warnings ? [warnings] : [];
    } catch (e) {
      if (e.message === 'CSS_VALIDATOR_BLOCKED') {
        cssBlocked = true;
      } else {
        throw e;
      }
    }

    // CSS validator 차단 시: Playwright로 직접 페이지 캡처 시도
    let cssScreenshot = null;
    if (!cssBlocked) {
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
    }

    res.json({
      errors,
      warnings,
      errorCount,
      warningCount,
      cssScreenshot,
      // 차단된 경우 클라이언트에서 직접 링크 안내
      cssValidatorUrl: cssBlocked
        ? `https://jigsaw.w3.org/css-validator/validator?uri=${encodeURIComponent(url)}&lang=ko`
        : null,
    });
  } catch (e) {
    if (browser) await browser.close().catch(() => {});
    res.status(500).json({ detail: e.message });
  }
}
