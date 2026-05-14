import path from 'path';
import * as cheerio from 'cheerio';
import { generateHwpx } from '../../lib/generate-hwpx.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: '50mb',
  },
};

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });
  try {
    const { items = [] } = req.body;
    if (!items.length) return res.status(400).json({ detail: '항목이 없습니다.' });

    const uniqueUrls = [...new Set(items.map(item => item.url).filter(Boolean))];
    const titleMap = {};
    await Promise.all(uniqueUrls.map(async url => {
      titleMap[url] = await fetchTitle(url);
    }));

    const enrichedItems = items.map(item => ({
      ...item,
      title: titleMap[item.url] || item.url,
    }));

    const templatePath = path.join(process.cwd(), 'template.hwpx');
    const hwpx = generateHwpx(templatePath, { items: enrichedItems });
    res.setHeader('Content-Type', 'application/vnd.hancom.hwpx');
    res.setHeader('Content-Disposition', 'attachment; filename="webstandard_inspection.hwpx"');
    res.setHeader('Content-Length', String(hwpx.length));
    res.send(hwpx);
  } catch (e) {
    res.status(500).json({ detail: e.message });
  }
}
