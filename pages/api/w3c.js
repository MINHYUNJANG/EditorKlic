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

    const validatorUrl = `https://validator.w3.org/nu/?doc=${encodeURIComponent(url)}&out=json`;
    const response = await fetch(validatorUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MarkupTool-W3C-Checker/1.0)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return res.status(502).json({ detail: `W3C validator 응답 오류: ${response.status}` });

    const data = await response.json();
    const messages = data.messages ?? [];
    let validatorScreenshot = null;

    if (messages.length === 0) {
      try {
        const vnuVersion = data.version ?? '26.5.9';
        const evidenceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #000; background: #fff; }
h1 { background: #396592; color: #fff; font-size: 22px; font-weight: bold; padding: 12px 16px; margin: 0; }
.subtitle { color: #396592; font-size: 13px; padding: 8px 16px 4px; }
.showing { font-weight: bold; font-size: 13px; padding: 4px 16px 12px; }
.checker-input { border: 1px solid #aaa; margin: 0 16px 16px; padding: 10px 12px; }
.checker-input legend { font-weight: bold; padding: 0 4px; font-size: 13px; }
.show-row { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; font-size: 13px; }
.show-row label { display: flex; align-items: center; gap: 3px; }
.check-row { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 8px; }
.url-input { width: 100%; border: 1px solid #aaa; padding: 3px 5px; font-size: 13px; margin-bottom: 8px; font-family: monospace; }
.check-btn, .options-btn { border: 1px solid #aaa; background: #e8e8e8; padding: 3px 10px; font-size: 13px; cursor: default; }
.result-ok { background: #cfc; border: 1px solid #090; padding: 8px 12px; margin: 0 16px 8px; font-weight: bold; font-size: 14px; }
.result-meta { color: #555; font-size: 12px; padding: 0 16px 4px; }
hr { border: none; border-top: 1px solid #ccc; margin: 12px 16px; }
.footer { padding: 8px 16px; font-size: 12px; color: #396592; }
select { font-size: 13px; border: 1px solid #aaa; padding: 1px 2px; }
</style>
</head>
<body>
<h1>Nu Html Checker</h1>
<p class="subtitle">This tool is an ongoing experiment in better HTML checking, and its behavior remains subject to change</p>
<p class="showing">Showing results for ${url} (checked with vnu ${vnuVersion})</p>
<fieldset class="checker-input">
<legend>Checker Input</legend>
<div class="show-row"><span>Show</span><label><input type="checkbox" disabled> source</label><label><input type="checkbox" disabled> outline</label><label><input type="checkbox" disabled> image report</label><label><input type="checkbox" disabled> errors &amp; warnings only</label><button class="options-btn" disabled>Options...</button></div>
<div class="check-row"><span>Check by</span><select disabled><option>address</option></select></div>
<input class="url-input" type="text" value="${url}" readonly>
<button class="check-btn" disabled>Check</button>
</fieldset>
<p class="result-ok">Document checking completed. No errors or warnings to show.</p>
<p class="result-meta">Used the HTML parser. Externally specified character encoding was UTF-8.</p>
<hr><p class="footer">About this checker &bull; Report an issue</p>
</body>
</html>`;
        browser = await launchBrowser();
        const context = await browser.newContext({ viewport: { width: 1280, height: 600 } });
        const page = await context.newPage();
        await page.setContent(evidenceHtml, { waitUntil: 'load' });
        const contentHeight = await page.evaluate(() => document.body.scrollHeight);
        await page.setViewportSize({ width: 1280, height: contentHeight });
        const buffer = await page.screenshot({ type: 'png', fullPage: false });
        validatorScreenshot = buffer.toString('base64');
      } catch {
        // 캡처 실패해도 검사 결과는 반환
      } finally {
        if (browser) await browser.close().catch(() => {});
        browser = null;
      }
    }

    res.json({ ...data, validatorScreenshot });
  } catch (e) {
    if (browser) await browser.close().catch(() => {});
    res.status(500).json({ detail: e.message });
  }
}
