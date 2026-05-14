import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  const { path: imgPath } = req.query;
  if (!imgPath || typeof imgPath !== 'string') {
    return res.status(400).json({ error: 'path 파라미터가 필요합니다.' });
  }

  // 경로 탈출 방지
  const safePath = path.normalize(imgPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join('/tmp', 'figma-markup', safePath);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: '이미지를 찾을 수 없습니다.' });
  }

  const ext = path.extname(fullPath).toLowerCase();
  const mimeMap = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
  const contentType = mimeMap[ext] || 'image/png';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  fs.createReadStream(fullPath).pipe(res);
}
