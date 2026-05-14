import fs from 'fs';
import zlib from 'zlib';

const BROWSER_LABELS = {
  chrome: 'Chrome',
  edge: 'Edge',
  whale: 'Whale',
  firefox: 'Firefox',
  safari: 'Safari',
  ios: 'iOS',
  android: 'Android',
};

const MAX_BROWSER_ROWS_PER_TABLE = 3;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosTimeDate(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dosDate };
}

function findEndOfCentralDirectory(buffer) {
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) return i;
  }
  throw new Error('HWPX ZIP 정보를 찾을 수 없습니다.');
}

function readZip(buffer) {
  const eocd = findEndOfCentralDirectory(buffer);
  const entryCount = buffer.readUInt16LE(eocd + 10);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  const files = {};
  const order = [];
  let offset = centralOffset;

  for (let i = 0; i < entryCount; i++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('ZIP central directory 파싱 실패');
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.slice(offset + 46, offset + 46 + nameLength).toString('utf8');

    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error(`ZIP local header 파싱 실패: ${name}`);
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.slice(dataStart, dataStart + compressedSize);
    let data;
    if (method === 0) data = Buffer.from(compressed);
    else if (method === 8) data = zlib.inflateRawSync(compressed);
    else throw new Error(`지원하지 않는 ZIP 압축 방식입니다: ${method}`);
    if (data.length !== uncompressedSize) throw new Error(`ZIP 압축 해제 크기 불일치: ${name}`);

    files[name] = { data, method };
    order.push(name);
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return { files, order };
}

function writeZip(entries) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  const { time, date } = dosTimeDate();

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, 'utf8');
    const raw = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data);
    const method = entry.method === 0 ? 0 : 8;
    const compressed = method === 0 ? raw : zlib.deflateRawSync(raw);
    const crc = crc32(raw);

    const local = Buffer.alloc(30 + nameBuffer.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuffer.copy(local, 30);
    localParts.push(local, compressed);

    const central = Buffer.alloc(46 + nameBuffer.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBuffer.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(localOffset, 42);
    nameBuffer.copy(central, 46);
    centralParts.push(central);

    localOffset += local.length + compressed.length;
  }

  const centralOffset = localOffset;
  const centralBuffer = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuffer.length, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralBuffer, eocd]);
}

function xmlEscape(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function normalizeSystemName(title, fallback = '') {
  const clean = String(title || '').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;

  const beforeSite = clean.split('|')[0].trim();
  const breadcrumbParts = beforeSite
    .split(/\s*[<>]\s*/g)
    .map(part => part.trim())
    .filter(Boolean);

  if (breadcrumbParts.length >= 2) return breadcrumbParts[breadcrumbParts.length - 1];
  return beforeSite || fallback;
}

function makeGeneratedCharPr(id, { height = 1000, bold = false, spacing = 0 } = {}) {
  const weight = bold ? '<hh:bold/>' : '';
  return `<hh:charPr id="${id}" height="${height}" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2"><hh:fontRef hangul="1" latin="1" hanja="1" japanese="1" other="1" symbol="1" user="1"/><hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:spacing hangul="${spacing}" latin="${spacing}" hanja="${spacing}" japanese="${spacing}" other="${spacing}" symbol="${spacing}" user="${spacing}"/><hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/><hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>${weight}<hh:underline type="NONE" shape="SOLID" color="#000000"/><hh:strikeout shape="NONE" color="#000000"/><hh:outline type="NONE"/><hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/></hh:charPr>`;
}

function appendGeneratedCharPr(headerXml) {
  const generated = [
    makeGeneratedCharPr(20, { height: 950, bold: true, spacing: 0 }),
    makeGeneratedCharPr(21, { height: 850, bold: false, spacing: 6 }),
  ].join('');

  return headerXml
    .replace(/<hh:charProperties itemCnt="(\d+)"/, (_, count) => `<hh:charProperties itemCnt="${Number(count) + 2}"`)
    .replace('</hh:charProperties>', `${generated}</hh:charProperties>`);
}

function pngSize(data) {
  if (!data || data.length < 24) return [0, 0];
  return [data.readUInt32BE(16), data.readUInt32BE(20)];
}

function fitImage(imgW, imgH, maxW, maxH) {
  if (imgW <= 0 || imgH <= 0) return [maxW, maxH];
  const scale = Math.min(maxW / imgW, maxH / imgH);
  return [Math.round(imgW * scale), Math.round(imgH * scale)];
}

function makeTextRun(charPrId, text) {
  return `<hp:run charPrIDRef="${charPrId}"><hp:t>${xmlEscape(text)}</hp:t></hp:run>`;
}

function makePicRun(charPrId, binId, picW, picH, picId = 1) {
  const cx = Math.floor(picW / 2);
  const cy = Math.floor(picH / 2);
  return `<hp:run charPrIDRef="${charPrId}"><hp:pic id="${picId}" zOrder="0" numberingType="PICTURE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" href="" groupLevel="0" instid="${picId}" reverse="0"><hp:offset x="0" y="0"/><hp:orgSz width="${picW}" height="${picH}"/><hp:curSz width="0" height="0"/><hp:flip horizontal="0" vertical="0"/><hp:rotationInfo angle="0" centerX="${cx}" centerY="${cy}" rotateimage="1"/><hp:renderingInfo><hc:transMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/><hc:scaMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/><hc:rotMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/></hp:renderingInfo><hc:img binaryItemIDRef="${binId}" bright="0" contrast="0" effect="REAL_PIC" alpha="0"/><hp:imgRect><hc:pt0 x="0" y="0"/><hc:pt1 x="${picW}" y="0"/><hc:pt2 x="${picW}" y="${picH}"/><hc:pt3 x="0" y="${picH}"/></hp:imgRect><hp:imgClip left="0" right="${picW}" top="0" bottom="${picH}"/><hp:inMargin left="0" right="0" top="0" bottom="0"/><hp:imgDim dimwidth="${picW}" dimheight="${picH}"/><hp:effects/><hp:sz width="${picW}" widthRelTo="ABSOLUTE" height="${picH}" heightRelTo="ABSOLUTE" protect="0"/><hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="CENTER" vertOffset="0" horzOffset="0"/><hp:outMargin left="0" right="0" top="0" bottom="0"/><hp:shapeComment>그림</hp:shapeComment></hp:pic><hp:t/></hp:run>`;
}

function cellInnerW(cellW, left = 510, right = 510) {
  return cellW - left - right;
}

function cellInnerH(cellH, top = 141, bottom = 141) {
  return cellH - top - bottom;
}

function replaceCellContent(tblXml, colAddr, rowAddr, newRun, lineWrap = null) {
  const marker = `<hp:cellAddr colAddr="${colAddr}" rowAddr="${rowAddr}"/>`;
  const pos = tblXml.indexOf(marker);
  if (pos === -1) return tblXml;

  const tcStart = tblXml.lastIndexOf('<hp:tc ', pos);
  const tcEnd = tblXml.indexOf('</hp:tc>', pos) + '</hp:tc>'.length;
  let cell = tblXml.slice(tcStart, tcEnd);
  cell = cell.replace(/<hp:run charPrIDRef="\d+"\/>/, newRun);
  if (lineWrap) cell = cell.replace(/lineWrap="[^"]*"/, `lineWrap="${lineWrap}"`);
  return tblXml.slice(0, tcStart) + cell + tblXml.slice(tcEnd);
}

function fillListTable(tblXml, items, startNum = 1, colOffsets = [0, 1, 2]) {
  const rows = tblXml.match(/<hp:tr\b[^>]*>[\s\S]*?<\/hp:tr>/g) || [];
  const maxDataRows = rows.length - 1;
  let tbl = tblXml;
  for (let i = 0; i < Math.min(items.length, maxDataRows); i++) {
    const rowIdx = i + 1;
    tbl = replaceCellContent(tbl, colOffsets[0], rowIdx, makeTextRun('3', String(startNum + i)));
    tbl = replaceCellContent(tbl, colOffsets[1], rowIdx, makeTextRun('20', items[i].title || ''));
    tbl = replaceCellContent(tbl, colOffsets[2], rowIdx, makeTextRun('21', items[i].url || ''), 'ANY');
  }
  return [tbl, Math.min(items.length, maxDataRows)];
}

function removeUnusedRows(tblXml, keepFromRow2) {
  const matches = [...tblXml.matchAll(/<hp:tr\b[^>]*>[\s\S]*?<\/hp:tr>/g)];
  const rowsToKeep = 2 + keepFromRow2;
  if (rowsToKeep >= matches.length) return tblXml;
  let result = tblXml;
  for (let i = matches.length - 1; i >= rowsToKeep; i--) {
    const match = matches[i];
    result = result.slice(0, match.index) + result.slice(match.index + match[0].length);
  }
  return result.replace(/rowCnt="\d+"/, `rowCnt="${rowsToKeep}"`);
}

function updateTableHeight(tblXml) {
  const rows = tblXml.match(/<hp:tr\b[^>]*>[\s\S]*?<\/hp:tr>/g) || [];
  const height = rows.reduce((sum, row) => {
    const match = row.match(/<hp:cellSz\b[^>]*height="(\d+)"/);
    return sum + (match ? Number(match[1]) : 0);
  }, 0);
  if (!height) return tblXml;
  return tblXml.replace(/(<hp:sz\b[^>]*height=")\d+(")/, `$1${height}$2`);
}

function removeLeadingRows(tblXml, count) {
  const matches = [...tblXml.matchAll(/<hp:tr\b[^>]*>[\s\S]*?<\/hp:tr>/g)];
  if (count <= 0 || matches.length <= count) return tblXml;

  let result = tblXml;
  for (let i = count - 1; i >= 0; i--) {
    const match = matches[i];
    result = result.slice(0, match.index) + result.slice(match.index + match[0].length);
  }

  result = result
    .replace(/rowCnt="\d+"/, `rowCnt="${matches.length - count}"`)
    .replace(/rowAddr="(\d+)"/g, (_, value) => `rowAddr="${Math.max(0, Number(value) - count)}"`);

  return updateTableHeight(result);
}

function chunkItems(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks.length ? chunks : [[]];
}

export function generateHwpx(templatePath, data) {
  const items = data.items || [];
  if (!items.length) throw new Error('items가 비어 있습니다.');

  const template = fs.readFileSync(templatePath);
  const { files, order } = readZip(template);
  let sectionXml = files['Contents/section0.xml'].data.toString('utf8');
  let headerXml = files['Contents/header.xml'].data.toString('utf8');
  let contentHpf = files['Contents/content.hpf'].data.toString('utf8');
  const tableMatches = [...sectionXml.matchAll(/<hp:tbl\b[^>]*>[\s\S]*?<\/hp:tbl>/g)];
  const tableXmls = tableMatches.map(match => match[0]);
  if (tableXmls.length < 4) throw new Error('HWPX 템플릿에서 필요한 표를 찾을 수 없습니다.');

  const binItems = [];
  let binCounter = 1;
  const addBin = pngB64 => {
    if (!pngB64) return null;
    const idNum = binCounter++;
    const id = `image${idNum}`;
    const filename = `image${idNum}.png`;
    const raw = Buffer.from(pngB64, 'base64');
    const [imgW, imgH] = pngSize(raw);
    binItems.push({ id, filename, data: raw });
    return { id, idNum, imgW, imgH };
  };

  const seen = new Set();
  const uniqueItems = [];
  for (const item of items) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      uniqueItems.push({
        ...item,
        title: normalizeSystemName(item.title, item.url),
      });
    }
  }

  const [tbl1, filled1] = fillListTable(tableXmls[0], uniqueItems, 1);
  const [tbl2] = fillListTable(tableXmls[1], uniqueItems.slice(filled1), filled1 + 1);
  tableXmls[0] = tbl1;
  tableXmls[1] = tbl2;

  const rowSizes = [
    [12486, 20000, 35409, 20000],
    [12486, 20000, 35409, 20000],
    [12486, 20000, 35409, 20000],
  ];

  const tbl3Orig = tableXmls[2];
  const tbl4Orig = tableXmls[3].replace(/treatAsChar="\d+"/, 'treatAsChar="0"');
  const m3 = tableMatches[2];
  const m4 = tableMatches[3];
  const tbl3PStart = sectionXml.lastIndexOf('<hp:p ', m3.index);
  const tbl3PEnd = sectionXml.indexOf('</hp:p>', m3.index + m3[0].length) + '</hp:p>'.length;
  const tbl4PStart = sectionXml.lastIndexOf('<hp:p ', m4.index);
  const tbl4PEnd = sectionXml.indexOf('</hp:p>', m4.index + m4[0].length) + '</hp:p>'.length;
  const tbl3Pre = sectionXml.slice(tbl3PStart, m3.index);
  const tbl3Post = sectionXml.slice(m3.index + m3[0].length, tbl3PEnd);
  const tbl4PreOrig = sectionXml.slice(tbl4PStart, m4.index);
  const tbl4Pre = tbl4PreOrig.replace(/pageBreak="\d+"/, 'pageBreak="0"');
  const tbl4PreNext = tbl4PreOrig.replace(/pageBreak="\d+"/, 'pageBreak="1"');
  const tbl4Post = sectionXml.slice(m4.index + m4[0].length, tbl4PEnd);

  const fillTbl3 = (tblXml, item, num) => {
    const errCnt = item.w3c_error_count || 0;
    const warnCnt = item.w3c_warning_count || 0;
    let tbl = tblXml;
    tbl = replaceCellContent(tbl, 0, 1, makeTextRun('12', String(num)));
    tbl = replaceCellContent(tbl, 1, 1, makeTextRun('20', item.title || ''));
    tbl = replaceCellContent(tbl, 2, 1, makeTextRun('21', item.url || ''), 'ANY');
    tbl = replaceCellContent(tbl, 3, 1, makeTextRun('12', errCnt === 0 && warnCnt === 0 ? '적정' : '미적정'));
    const validator = addBin(item.validator_screenshot);
    if (validator) {
      const [picW, picH] = fitImage(validator.imgW, validator.imgH, cellInnerW(47895), cellInnerH(26912));
      tbl = replaceCellContent(tbl, 0, 2, makePicRun('3', validator.id, picW, picH, validator.idNum));
    }
    const css = addBin(item.css_screenshot);
    if (css) {
      const [picW, picH] = fitImage(css.imgW, css.imgH, cellInnerW(47895), cellInnerH(26912));
      tbl = replaceCellContent(tbl, 0, 3, makePicRun('3', css.id, picW, picH, css.idNum));
    }
    return tbl;
  };

  const fillTbl4 = (tblXml, item, num, browserItems, options = {}) => {
    let tbl = tblXml;
    tbl = replaceCellContent(tbl, 0, 1, makeTextRun('12', String(num)));
    tbl = replaceCellContent(tbl, 1, 1, makeTextRun('20', item.title || ''));
    tbl = replaceCellContent(tbl, 2, 1, makeTextRun('21', item.url || ''), 'ANY');
    tbl = replaceCellContent(tbl, 3, 1, makeTextRun('12', '적정'));
    browserItems.slice(0, MAX_BROWSER_ROWS_PER_TABLE).forEach((browserItem, index) => {
      const rowAddr = index + 2;
      const [, , rightW, rightH] = rowSizes[index];
      tbl = replaceCellContent(tbl, 0, rowAddr, makeTextRun('3', BROWSER_LABELS[browserItem.browser] || browserItem.browser || ''));
      const shot = addBin(browserItem.screenshot);
      if (shot) {
        const [picW, picH] = fitImage(shot.imgW, shot.imgH, cellInnerW(rightW), cellInnerH(rightH));
        tbl = replaceCellContent(tbl, 2, rowAddr, makePicRun('3', shot.id, picW, picH, shot.idNum));
      }
    });
    tbl = removeUnusedRows(tbl, Math.min(browserItems.length, MAX_BROWSER_ROWS_PER_TABLE));
    return options.continuation ? removeLeadingRows(tbl, 2) : updateTableHeight(tbl);
  };

  const first = uniqueItems[0] || {};
  const firstBrowserItems = items.filter(item => item.url === first.url);
  const firstBrowserChunks = chunkItems(firstBrowserItems, MAX_BROWSER_ROWS_PER_TABLE);
  tableXmls[2] = fillTbl3(tbl3Orig, first, 1);
  tableXmls[3] = fillTbl4(tbl4Orig, first, 1, firstBrowserChunks[0]);

  let resultXml = sectionXml;
  for (let i = tableMatches.length - 1; i >= 0; i--) {
    const match = tableMatches[i];
    resultXml = resultXml.slice(0, match.index) + tableXmls[i] + resultXml.slice(match.index + match[0].length);
  }
  resultXml = resultXml.replace(tbl4PreOrig, tbl4Pre);

  let t4Extra = '';
  uniqueItems.forEach((item, index) => {
    const num = index + 1;
    const browserItems = items.filter(entry => entry.url === item.url);
    const browserChunks = chunkItems(browserItems, MAX_BROWSER_ROWS_PER_TABLE);
    const startChunk = index === 0 ? 1 : 0;
    browserChunks.slice(startChunk).forEach((chunk, chunkIndex) => {
      const pre4 = tbl4PreNext.replace(/ id="\d+"/, ' id="0"');
      const isContinuation = startChunk + chunkIndex > 0;
      t4Extra += pre4 + fillTbl4(tbl4Orig, item, num, chunk, { continuation: isContinuation }) + tbl4Post;
    });
  });

  if (uniqueItems.length > 1) {
    let t3Extra = '';
    uniqueItems.slice(1).forEach((item, index) => {
      const num = index + 2;
      const pre3 = tbl3Pre.replace(/pageBreak="\d+"/, 'pageBreak="0"').replace(/ id="\d+"/, ' id="0"');
      t3Extra += pre3 + fillTbl3(tbl3Orig, item, num) + tbl3Post;
    });

    let tblEnds = [...resultXml.matchAll(/<\/hp:tbl>/g)];
    if (tblEnds.length >= 3) {
      const insert = resultXml.indexOf('</hp:p>', tblEnds[2].index) + '</hp:p>'.length;
      resultXml = resultXml.slice(0, insert) + t3Extra + resultXml.slice(insert);
    }
  }

  if (t4Extra) {
    const tblEnds = [...resultXml.matchAll(/<\/hp:tbl>/g)];
    const t4Index = 2 + uniqueItems.length;
    if (tblEnds.length > t4Index) {
      const insert = resultXml.indexOf('</hp:p>', tblEnds[t4Index].index) + '</hp:p>'.length;
      resultXml = resultXml.slice(0, insert) + t4Extra + resultXml.slice(insert);
    }
  }

  if (binItems.length > 0) {
    const manifestItems = binItems
      .map(item => `<opf:item id="${item.id}" href="BinData/${item.filename}" media-type="image/png" isEmbeded="1"/>`)
      .join('');
    contentHpf = contentHpf.replace('</opf:manifest>', `${manifestItems}</opf:manifest>`);
  }
  headerXml = appendGeneratedCharPr(headerXml);

  const entries = order.map(name => {
    if (name === 'Contents/header.xml') return { name, data: Buffer.from(headerXml, 'utf8'), method: files[name].method };
    if (name === 'Contents/section0.xml') return { name, data: Buffer.from(resultXml, 'utf8'), method: files[name].method };
    if (name === 'Contents/content.hpf') return { name, data: Buffer.from(contentHpf, 'utf8'), method: files[name].method };
    return { name, data: files[name].data, method: files[name].method };
  });
  binItems.forEach(item => entries.push({ name: `BinData/${item.filename}`, data: item.data, method: 0 }));
  return writeZip(entries);
}
