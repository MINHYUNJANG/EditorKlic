import path from 'path';
import fs from 'fs';
import {
  figmaAccurateMarkup,
  parseFigmaUrl,
  getTopFrameIds,
  fetchImageFillUrls,
  getFigmaNodeFull,
  collectIllustrationNodeIds,
  collectImageRefs,
} from '../../lib/figma.js';
import { convertFigmaNode } from '../../lib/figma-converter.js';

const TIMEOUT_MS = 60000;

function withTimeout(promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('처리 시간이 초과되었습니다.')), TIMEOUT_MS)
    ),
  ]);
}

function collectImageFillNodes(node, result = [], skipIds = new Set()) {
  if (!node || node.visible === false) return result;
  if (skipIds.has(node.id)) return result;
  const fill = (node.fills || []).find(f => f.visible !== false && f.type === 'IMAGE' && f.imageRef);
  if (fill) {
    const vis = (node.children || []).filter(c => c.visible !== false);
    result.push({ id: node.id, ref: fill.imageRef, isPure: vis.length === 0 });
  }
  for (const c of (node.children || [])) collectImageFillNodes(c, result, skipIds);
  return result;
}

async function fetchExportUrls(fileKey, nodeIds) {
  if (!nodeIds.length) return {};
  const token = process.env.FIGMA_ACCESS_TOKEN;
  if (!token) return {};
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    const resp = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeIds.join(','))}&format=png&scale=2`,
      { headers: { 'X-Figma-Token': token }, signal: controller.signal }
    );
    clearTimeout(timer);
    if (!resp.ok) return {};
    const body = await resp.json();
    const images = body.images ?? {};
    return Object.fromEntries(Object.entries(images).filter(([, v]) => v));
  } catch (e) {
    console.warn('[일러스트 export 실패]', e.message);
    return {};
  }
}

async function saveImageToTmp(cdnUrl, filePath) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const resp = await fetch(cdnUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (!resp.ok) return null;
    const ct = resp.headers.get('content-type') || '';
    const ext = ct.includes('jpeg') ? 'jpg' : ct.includes('webp') ? 'webp' : 'png';
    const finalPath = filePath.replace(/\.\w+$/, '') + '.' + ext;
    fs.writeFileSync(finalPath, Buffer.from(await resp.arrayBuffer()));
    return finalPath;
  } catch (e) {
    console.warn('[이미지 저장 실패]', e.message);
    return null;
  }
}

// Vercel 배포 환경이면 /tmp, 로컬이면 public/figma-markup에 저장
const IS_VERCEL = !!process.env.VERCEL;

function getImgDir(safeName) {
  if (IS_VERCEL) return path.join('/tmp', 'figma-markup', safeName, 'images');
  return path.join(process.cwd(), 'public', 'figma-markup', safeName, 'images');
}

function getImagePublicPath(safeName, fileName) {
  if (IS_VERCEL) return `/api/figma-image?path=${encodeURIComponent(`${safeName}/images/${fileName}`)}`;
  return `/figma-markup/${safeName}/images/${fileName}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ detail: 'Method not allowed' });
  try {
    const { url, markup_type = 'html', project_name = '' } = req.body;
    if (!url) return res.status(400).json({ detail: 'Figma URL이 필요합니다.' });

    // project_name 없으면 기존 방식 (파일 저장 없음)
    if (!project_name.trim()) {
      const result = await withTimeout(figmaAccurateMarkup(url, markup_type));
      return res.json(result);
    }

    // ── 프로젝트 폴더 생성 (/tmp 사용) ────────────────────────
    const safeName = project_name.trim().replace(/[\\/:*?"<>|]/g, '_');
    const imgFolderPath = getImgDir(safeName);
    fs.mkdirSync(imgFolderPath, { recursive: true });

    // ── Figma 노드 ID 파악 ────────────────────────────────────
    const [fileKey, nodeId] = parseFigmaUrl(url);
    let nodeIds;
    try {
      nodeIds = nodeId ? [nodeId] : await getTopFrameIds(fileKey);
    } catch (e) {
      throw new Error(`Figma 프레임 조회 실패: ${e.message}`);
    }
    if (!nodeIds.length) throw new Error('내보낼 프레임을 찾을 수 없습니다. Figma URL에 node-id를 포함해 주세요.');

    let allCdnUrls = {};
    try { allCdnUrls = await fetchImageFillUrls(fileKey); } catch { /* 계속 진행 */ }

    const allHtml = [], allCss = [], allJsx = [];
    const savedImages = [];
    let imgIdx = 0;

    for (const nid of nodeIds.slice(0, 3)) {
      let nodeData;
      try { nodeData = await getFigmaNodeFull(fileKey, nid); } catch (e) {
        if (e.message === 'FIGMA_RATE_LIMIT' || e.message === 'FIGMA_TOKEN_INVALID') throw e;
        console.warn('[노드 조회 실패]', e.message);
        continue;
      }
      if (!nodeData) continue;

      const imageNodeMap = {};
      const bgImageUrls = {};
      const refCache = {};

      // ① 벡터 일러스트 그룹 → Figma export PNG
      const illNodeIds = collectIllustrationNodeIds(nodeData);
      if (illNodeIds.length > 0) {
        const exportUrls = await fetchExportUrls(fileKey, illNodeIds);
        const downloadTasks = illNodeIds
          .filter(id => exportUrls[id])
          .map(async (id) => {
            const basePath = path.join(imgFolderPath, `img_${String(++imgIdx).padStart(2, '0')}`);
            const savedPath = await saveImageToTmp(exportUrls[id], basePath);
            if (savedPath) {
              const fileName = path.basename(savedPath);
              imageNodeMap[id] = getImagePublicPath(safeName, fileName);
              return fileName;
            }
            return null;
          });
        const settled = await Promise.allSettled(downloadTasks);
        settled.forEach(r => { if (r.status === 'fulfilled' && r.value) savedImages.push(r.value); });
      }

      // ② IMAGE fill 노드 → CDN 원본 이미지 다운로드
      const fillNodes = collectImageFillNodes(nodeData, [], new Set(illNodeIds));
      const fillTasks = fillNodes
        .filter(fn => allCdnUrls[fn.ref] && !refCache[fn.ref])
        .map(async (fn) => {
          const basePath = path.join(imgFolderPath, `img_${String(++imgIdx).padStart(2, '0')}`);
          const savedPath = await saveImageToTmp(allCdnUrls[fn.ref], basePath);
          if (savedPath) {
            const fileName = path.basename(savedPath);
            const apiPath = getImagePublicPath(safeName, fileName);
            refCache[fn.ref] = apiPath;
            bgImageUrls[fn.ref] = apiPath;
            return { fn, apiPath, fileName };
          }
          return null;
        });

      const fillSettled = await Promise.allSettled(fillTasks);
      fillSettled.forEach(r => {
        if (r.status === 'fulfilled' && r.value) {
          const { fn, apiPath, fileName } = r.value;
          savedImages.push(fileName);
          if (fn.isPure) imageNodeMap[fn.id] = apiPath;
          bgImageUrls[fn.ref] = apiPath;
        }
      });

      fillNodes.forEach(fn => {
        if (refCache[fn.ref]) {
          bgImageUrls[fn.ref] = refCache[fn.ref];
          if (fn.isPure && !imageNodeMap[fn.id]) imageNodeMap[fn.id] = refCache[fn.ref];
        }
      });

      // ③ 마크업 변환
      const result = convertFigmaNode(nodeData, markup_type, bgImageUrls, new Set(), imageNodeMap);

      if (markup_type === 'react') {
        allJsx.push(result.jsx);
        allCss.push(result.css);
      } else {
        allHtml.push(result.html);
        allCss.push(result.css);
      }
    }

    if (!allHtml.length && !allJsx.length) throw new Error('마크업 생성에 실패했습니다.');

    const finalResult = { css: allCss.join('\n\n'), frame_count: allHtml.length || allJsx.length };
    if (markup_type === 'react') finalResult.jsx = allJsx.join('\n\n');
    else finalResult.html = allHtml.join('\n\n');
    if (savedImages.length > 0) finalResult.saved_images = [...new Set(savedImages)];

    res.json(finalResult);
  } catch (e) {
    let detail = e.message;
    let status = 500;
    if (e.message === 'FIGMA_RATE_LIMIT') {
      status = 429;
      detail = 'Figma API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    } else if (e.message === 'FIGMA_TOKEN_INVALID') {
      status = 403;
      detail = 'Figma API 토큰이 유효하지 않거나 만료되었습니다. .env.local의 FIGMA_ACCESS_TOKEN을 확인해주세요.';
    } else if (e.message.includes('올바른 Figma URL')) {
      status = 400;
    }
    res.status(status).json({ detail });
  }
}
