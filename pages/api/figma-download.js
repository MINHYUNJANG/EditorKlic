import JSZip from 'jszip';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });

  try {
    const { html, jsx, css, blob_urls = {}, project_name = 'figma-markup', markup_type = 'html' } = req.body;
    const isReact = markup_type === 'react';
    const code = isReact ? jsx : html;
    if (!code && !css) return res.status(400).json({ detail: '다운로드할 내용이 없습니다.' });

    const zip = new JSZip();
    const imgFolder = zip.folder('images');

    let modifiedCode = code || '';
    let modifiedCss = css || '';

    // Blob CDN 이미지를 다운로드 후 ZIP에 추가, 코드 내 URL을 로컬 경로로 치환
    const fetchTasks = Object.entries(blob_urls).map(async ([fileName, cdnUrl]) => {
      try {
        const resp = await fetch(cdnUrl, { signal: AbortSignal.timeout(20000) });
        if (!resp.ok) return;
        const buffer = Buffer.from(await resp.arrayBuffer());
        imgFolder.file(fileName, buffer);
        // HTML/JSX와 CSS 양쪽에서 CDN URL을 로컬 상대경로로 치환
        modifiedCode = modifiedCode.replaceAll(cdnUrl, `images/${fileName}`);
        modifiedCss = modifiedCss.replaceAll(cdnUrl, `images/${fileName}`);
      } catch (e) {
        console.warn(`[이미지 다운로드 실패] ${fileName}:`, e.message);
      }
    });
    await Promise.allSettled(fetchTasks);

    // 파일 구성
    if (isReact) {
      zip.file('index.jsx', modifiedCode);
      zip.file('style.css', modifiedCss);
    } else {
      const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="style.css">
</head>
<body>
${modifiedCode}
</body>
</html>`;
      zip.file('index.html', fullHtml);
      zip.file('style.css', modifiedCss);
    }

    const safeName = project_name.trim().replace(/[\\/:*?"<>|]/g, '_') || 'figma-markup';
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.zip"`);
    res.send(zipBuffer);
  } catch (e) {
    res.status(500).json({ detail: e.message });
  }
}
