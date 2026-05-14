import * as cheerio from 'cheerio';
import { launchBrowser } from '../../lib/playwright-helper.js';

async function extractUrlsFromSitemap(origin) {
  const candidates = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/sitemap/sitemap.xml`,
  ];
  for (const u of candidates) {
    try {
      const res = await fetch(u, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const xml = await res.text();
      const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
        .map(m => m[1].trim())
        .filter(u => !u.endsWith('.xml'));
      if (urls.length > 0) return urls;
    } catch {}
  }
  return null;
}

async function extractUrlsFromNav(pageUrl) {
  const origin = new URL(pageUrl).origin;
  let html;
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    html = await page.content();
  } catch {
    const res = await fetch(pageUrl, { signal: AbortSignal.timeout(8000) });
    html = await res.text();
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  const $ = cheerio.load(html);
  const urls = new Set();
  const NAV_SEL = 'nav, #gnb, #lnb, .gnb, .lnb, .nav, .menu, .navigation, header ul, #menu, .top-menu, .site-map';

  $(NAV_SEL).find('a[href]').each((_, a) => {
    try {
      const href = new URL($(a).attr('href'), pageUrl).href;
      if (href.startsWith(origin) && !href.match(/\.(jpg|jpeg|png|gif|pdf|zip|hwp|docx?)(\?|$)/i)) {
        urls.add(href);
      }
    } catch {}
  });

  if (urls.size < 5) {
    $('a[href]').each((_, a) => {
      try {
        const href = new URL($(a).attr('href'), pageUrl).href;
        if (href.startsWith(origin) && !href.match(/\.(jpg|jpeg|png|gif|pdf|zip|hwp|docx?)(\?|$)/i)) {
          urls.add(href);
        }
      } catch {}
    });
  }

  return [...urls];
}

async function fetchTitle(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    });
    if (!res.ok) return '';
    const html = await res.text();
    const $ = cheerio.load(html);
    return $('title').first().text().trim().replace(/\s+/g, ' ') || '';
  } catch { return ''; }
}

async function fetchTitles(urls, concurrency = 5) {
  const results = new Array(urls.length).fill('');
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const titles = await Promise.all(batch.map(fetchTitle));
    titles.forEach((t, j) => { results[i + j] = t; });
  }
  return results;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });
  try {
    const { url } = req.body;
    const origin = new URL(url).origin;

    let urls = await extractUrlsFromSitemap(origin);
    let source = 'sitemap';

    if (!urls || urls.length === 0) {
      urls = await extractUrlsFromNav(url);
      source = 'nav';
    }

    const unique = [...new Set(urls)].slice(0, 200);
    const titles = await fetchTitles(unique);
    const items = unique.map((u, i) => ({ url: u, title: titles[i] }));

    res.json({ items, source, total: items.length });
  } catch (e) {
    res.status(500).json({ detail: e.message });
  }
}
