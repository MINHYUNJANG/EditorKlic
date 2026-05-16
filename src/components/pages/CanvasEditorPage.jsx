import { useEffect, useRef, useState } from 'react';

const DEFAULT_SIZE = { width: 800, height: 600 };
const RESIZE_HANDLE_SIZE = 12;
const FONT_OPTIONS = ['Pretendard', 'Arial', 'Georgia', 'Times New Roman', 'monospace', 'serif'];
const ICON_OPTIONS = [
  { value: '⭐', label: '스타' },
  { value: '🔥', label: '불꽃' },
  { value: '❤️', label: '하트' },
  { value: '🎵', label: '음표' },
  { value: '🌟', label: '별빛' },
  { value: '🎯', label: '목표' },
  { value: '🎉', label: '축하' },
  { value: '✅', label: '체크' },
  { value: '💡', label: '아이디어' },
];
const MARKUP_CATEGORIES = [
  { value: 'list', label: '리스트' },
  { value: 'table', label: '테이블' },
  { value: 'process', label: '절차' },
  { value: 'box', label: '박스' },
];
const MARKUP_TEMPLATES = {
  list: [
    {
      id: 'list-basic',
      label: '기본 목록',
      preview: 'list-basic',
      html: '<ul class="notice-list">\n  <li>첫 번째 안내 항목</li>\n  <li>두 번째 안내 항목</li>\n  <li>세 번째 안내 항목</li>\n</ul>',
    },
    {
      id: 'list-check',
      label: '체크 목록',
      preview: 'list-check',
      html: '<ul class="check-list">\n  <li>신청서 제출</li>\n  <li>담당자 확인</li>\n  <li>결과 안내</li>\n</ul>',
    },
  ],
  table: [
    {
      id: 'table-basic',
      label: '기본 표',
      preview: 'table-basic',
      html: '<table class="info-table">\n  <thead><tr><th>구분</th><th>내용</th></tr></thead>\n  <tbody>\n    <tr><td>일시</td><td>2026. 05. 16.</td></tr>\n    <tr><td>장소</td><td>강당</td></tr>\n  </tbody>\n</table>',
    },
    {
      id: 'table-schedule',
      label: '일정 표',
      preview: 'table-schedule',
      html: '<table class="schedule-table">\n  <tr><th>시간</th><th>프로그램</th></tr>\n  <tr><td>10:00</td><td>접수</td></tr>\n  <tr><td>10:30</td><td>행사 시작</td></tr>\n</table>',
    },
  ],
  process: [
    {
      id: 'process-steps',
      label: '3단계 절차',
      preview: 'process-steps',
      html: '<ol class="step-list">\n  <li>1단계: 신청</li>\n  <li>2단계: 확인</li>\n  <li>3단계: 완료</li>\n</ol>',
    },
    {
      id: 'process-flow',
      label: '진행 흐름',
      preview: 'process-flow',
      html: '<div class="process-flow">\n  <span>접수</span>\n  <span>검토</span>\n  <span>안내</span>\n</div>',
    },
  ],
  box: [
    {
      id: 'box-notice',
      label: '공지 박스',
      preview: 'box-notice',
      html: '<div class="notice-box">\n  <strong>알림</strong>\n  <p>중요한 안내 내용을 입력하세요.</p>\n</div>',
    },
    {
      id: 'box-highlight',
      label: '강조 박스',
      preview: 'box-highlight',
      html: '<div class="highlight-box">\n  <strong>확인해주세요</strong>\n  <p>가정통신문 또는 팝업에 들어갈 핵심 문구를 입력하세요.</p>\n</div>',
    },
  ],
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getFont(item) {
  const style = item.italic ? 'italic' : 'normal';
  const weight = item.bold ? '700' : '400';
  const family = ['serif', 'monospace'].includes(item.font) ? item.font : `"${item.font || 'Pretendard'}", sans-serif`;
  return `${style} ${weight} ${item.size}px ${family}`;
}

function stripMarkup(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(li|tr|p|div|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function splitMarkupSections(html) {
  return html
    .split(/\n{2,}/)
    .map(section => stripMarkup(section))
    .filter(section => section.length > 0);
}

function createInitialMarkupForm() {
  return {
    category: 'list',
    templateId: '',
  };
}

function createInitialTextForm() {
  return {
    value: '',
    font: 'Pretendard',
    bold: false,
    italic: false,
    underline: false,
    size: 48,
    color: '#000000',
    x: DEFAULT_SIZE.width / 2,
    y: DEFAULT_SIZE.height / 2,
  };
}

function CanvasEditorPage() {
  const canvasRef = useRef(null);
  const imageInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState(DEFAULT_SIZE);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgImage, setBgImage] = useState(null);
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [drag, setDrag] = useState(null);
  const [openPanel, setOpenPanel] = useState('text');
  const [workspaceTab, setWorkspaceTab] = useState('canvas');
  const [textForm, setTextForm] = useState(createInitialTextForm);
  const [iconForm, setIconForm] = useState({ value: '', size: 64, color: '#000000', x: 400, y: 300 });
  const [imageForm, setImageForm] = useState({ image: null, width: 200, height: 200, x: 400, y: 300 });
  const [markupForm, setMarkupForm] = useState(createInitialMarkupForm);

  const activeItem = items.find(item => item.id === activeId);
  const markupItems = items.filter(item => item.type === 'markup');
  const activeMarkupItem = activeItem?.type === 'markup' ? activeItem : markupItems[0];
  const selectedMarkupTemplates = MARKUP_TEMPLATES[markupForm.category] || [];

  function togglePanel(panel) {
    setOpenPanel(current => (current === panel ? null : panel));
  }

  function getResizeHandleBounds(bounds) {
    return {
      x: bounds.x + bounds.width - RESIZE_HANDLE_SIZE / 2,
      y: bounds.y + bounds.height - RESIZE_HANDLE_SIZE / 2,
      width: RESIZE_HANDLE_SIZE,
      height: RESIZE_HANDLE_SIZE,
    };
  }

  function isInsideBounds(x, y, bounds) {
    return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
  }

  function measureItem(ctx, item) {
    if (item.type === 'image' || item.type === 'markup') {
      return {
        x: item.x - item.width / 2,
        y: item.y - item.height / 2,
        width: item.width,
        height: item.height,
      };
    }

    ctx.font = item.type === 'text' ? getFont(item) : `${item.size}px sans-serif`;
    const measure = ctx.measureText(item.value);
    const width = measure.width + 16;
    const height = item.size + 16;
    return {
      x: item.x - width / 2,
      y: item.y - height / 2,
      width,
      height,
    };
  }

  function drawRoundedRect(ctx, x, y, width, height, radius = 12) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawMarkupItem(ctx, item) {
    const x = item.x - item.width / 2;
    const y = item.y - item.height / 2;
    const sections = splitMarkupSections(item.html);

    drawRoundedRect(ctx, x, y, item.width, item.height, 14);
    ctx.fillStyle = item.category === 'box' ? '#fff7ed' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = item.category === 'box' ? '#fb923c' : '#b9c2d0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0070c8';
    ctx.font = '700 18px "Pretendard", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(item.label, x + 18, y + 16);

    ctx.fillStyle = '#334155';
    ctx.font = '500 14px "Pretendard", sans-serif';

    let cursorY = y + 52;
    sections.forEach((section, sectionIndex) => {
      if (cursorY > y + item.height - 28) return;
      if (sectionIndex > 0) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(x + 18, cursorY - 8);
        ctx.lineTo(x + item.width - 18, cursorY - 8);
        ctx.stroke();
      }

      section.forEach((line, lineIndex) => {
        if (cursorY > y + item.height - 24) return;
        const prefix = item.category === 'process' ? `${lineIndex + 1}` : '•';
        const content = line.replace(/^\d단계:\s*/, '');
        ctx.fillStyle = item.category === 'process' ? '#0070c8' : '#334155';
        ctx.fillText(prefix, x + 20, cursorY);
        ctx.fillStyle = '#334155';
        ctx.fillText(content.slice(0, 34), x + 42, cursorY);
        cursorY += 22;
      });

      cursorY += 12;
    });
  }

  function drawUnderline(ctx, item) {
    const width = ctx.measureText(item.value).width;
    const y = item.y + item.size * 0.35;
    ctx.beginPath();
    ctx.moveTo(item.x - width / 2, y);
    ctx.lineTo(item.x + width / 2, y);
    ctx.lineWidth = Math.max(1, item.size / 18);
    ctx.strokeStyle = item.color;
    ctx.stroke();
  }

  function drawCanvas(options = {}) {
    const { showSelection = true } = options;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    if (bgImage) {
      const ratio = Math.min(canvasSize.width / bgImage.width, canvasSize.height / bgImage.height);
      const width = bgImage.width * ratio;
      const height = bgImage.height * ratio;
      ctx.drawImage(bgImage, (canvasSize.width - width) / 2, (canvasSize.height - height) / 2, width, height);
    }

    items.forEach(item => {
      if (item.type === 'text') {
        ctx.fillStyle = item.color;
        ctx.font = getFont(item);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.value, item.x, item.y);
        if (item.underline) drawUnderline(ctx, item);
      }

      if (item.type === 'icon') {
        ctx.fillStyle = item.color;
        ctx.font = `${item.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.value, item.x, item.y);
      }

      if (item.type === 'image') {
        ctx.drawImage(item.image, item.x - item.width / 2, item.y - item.height / 2, item.width, item.height);
      }

      if (item.type === 'markup') {
        drawMarkupItem(ctx, item);
      }

      if (showSelection && item.id === activeId) {
        const bounds = measureItem(ctx, item);
        ctx.strokeStyle = '#0070c8';
        ctx.lineWidth = 2;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        if (item.type === 'icon' || item.type === 'image' || item.type === 'markup') {
          const handle = getResizeHandleBounds(bounds);
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#0070c8';
          ctx.lineWidth = 2;
          ctx.fillRect(handle.x, handle.y, handle.width, handle.height);
          ctx.strokeRect(handle.x, handle.y, handle.width, handle.height);
        }
      }
    });
  }

  useEffect(drawCanvas, [canvasSize, bgColor, bgImage, items, activeId, workspaceTab]);

  useEffect(() => {
    if (document.fonts?.ready) document.fonts.ready.then(drawCanvas);
  }, []);

  function updateCenteredForms(nextSize) {
    const x = Math.round(nextSize.width / 2);
    const y = Math.round(nextSize.height / 2);
    setTextForm(form => ({ ...form, x, y }));
    setIconForm(form => ({ ...form, x, y }));
    setImageForm(form => ({ ...form, x, y }));
  }

  function handleCanvasSizeChange(field, value) {
    const nextSize = {
      ...canvasSize,
      [field]: Math.max(100, Number(value) || DEFAULT_SIZE[field]),
    };
    setCanvasSize(nextSize);
    updateCenteredForms(nextSize);
  }

  function loadImageFile(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => callback(image);
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function syncTextForm(item) {
    if (item?.type !== 'text') return;
    setTextForm({
      value: item.value,
      font: item.font || 'Pretendard',
      bold: Boolean(item.bold),
      italic: Boolean(item.italic),
      underline: Boolean(item.underline),
      size: item.size,
      color: item.color,
      x: Math.round(item.x),
      y: Math.round(item.y),
    });
  }

  function syncIconForm(item) {
    if (item?.type !== 'icon') return;
    setIconForm({
      value: item.value,
      size: item.size,
      color: item.color,
      x: Math.round(item.x),
      y: Math.round(item.y),
    });
  }

  function syncImageForm(item) {
    if (item?.type !== 'image') return;
    setImageForm(form => ({
      ...form,
      image: item.image,
      width: Math.round(item.width),
      height: Math.round(item.height),
      x: Math.round(item.x),
      y: Math.round(item.y),
    }));
  }

  function syncMarkupForm(item) {
    if (item?.type !== 'markup') return;
    setMarkupForm({
      category: item.category,
      templateId: item.templateId,
    });
  }

  function syncFormFromItem(item) {
    syncTextForm(item);
    syncIconForm(item);
    syncImageForm(item);
    syncMarkupForm(item);
    if (item?.type === 'text') setOpenPanel('text');
    if (item?.type === 'icon') setOpenPanel('icon');
    if (item?.type === 'image') setOpenPanel('image');
    if (item?.type === 'markup') setOpenPanel('markup');
  }

  function updateActiveText(patch) {
    const nextForm = { ...textForm, ...patch };
    setTextForm(nextForm);
    if (activeItem?.type !== 'text') return;
    setItems(prev => prev.map(item => (
      item.id === activeId
        ? {
          ...item,
          value: nextForm.value.trim() || '텍스트',
          font: nextForm.font,
          bold: nextForm.bold,
          italic: nextForm.italic,
          underline: nextForm.underline,
          size: Math.max(12, Number(nextForm.size) || 48),
          color: nextForm.color,
          x: clamp(Number(nextForm.x) || canvasSize.width / 2, 0, canvasSize.width),
          y: clamp(Number(nextForm.y) || canvasSize.height / 2, 0, canvasSize.height),
        }
        : item
    )));
  }

  function addText() {
    const item = {
      id: crypto.randomUUID(),
      type: 'text',
      value: textForm.value.trim() || '텍스트',
      font: textForm.font,
      bold: textForm.bold,
      italic: textForm.italic,
      underline: textForm.underline,
      size: Math.max(12, Number(textForm.size) || 48),
      color: textForm.color,
      x: clamp(Number(textForm.x) || canvasSize.width / 2, 0, canvasSize.width),
      y: clamp(Number(textForm.y) || canvasSize.height / 2, 0, canvasSize.height),
    };
    setItems(prev => [...prev, item]);
    setActiveId(item.id);
  }

  function addIcon() {
    if (!iconForm.value) {
      alert('추가할 아이콘을 선택해주세요.');
      return;
    }
    const item = {
      id: crypto.randomUUID(),
      type: 'icon',
      value: iconForm.value,
      size: Math.max(24, Number(iconForm.size) || 64),
      color: iconForm.color,
      x: clamp(Number(iconForm.x) || canvasSize.width / 2, 0, canvasSize.width),
      y: clamp(Number(iconForm.y) || canvasSize.height / 2, 0, canvasSize.height),
    };
    setItems(prev => [...prev, item]);
    setActiveId(item.id);
  }

  function addImage() {
    if (!imageForm.image) {
      alert('추가할 이미지를 선택해주세요.');
      return;
    }
    const item = {
      id: crypto.randomUUID(),
      type: 'image',
      image: imageForm.image,
      width: Math.max(50, Number(imageForm.width) || imageForm.image.width),
      height: Math.max(50, Number(imageForm.height) || imageForm.image.height),
      x: clamp(Number(imageForm.x) || canvasSize.width / 2, 0, canvasSize.width),
      y: clamp(Number(imageForm.y) || canvasSize.height / 2, 0, canvasSize.height),
    };
    setItems(prev => [...prev, item]);
    setActiveId(item.id);
  }

  function addMarkup(template) {
    const item = {
      id: crypto.randomUUID(),
      type: 'markup',
      category: markupForm.category,
      templateId: template.id,
      label: template.label,
      html: template.html,
      width: markupForm.category === 'table' ? 380 : 340,
      height: markupForm.category === 'process' ? 170 : 190,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
    };
    setItems(prev => [...prev, item]);
    setActiveId(item.id);
    setWorkspaceTab('canvas');
  }

  function updateActiveMarkupHtml(html) {
    if (!activeMarkupItem) return;
    setItems(prev => prev.map(item => (
      item.id === activeMarkupItem.id ? { ...item, html } : item
    )));
  }

  function getCanvasPosition(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function getItemAtPosition(x, y) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    for (let i = items.length - 1; i >= 0; i -= 1) {
      const item = items[i];
      const bounds = measureItem(ctx, item);
      if (isInsideBounds(x, y, bounds)) {
        return item;
      }
    }
    return null;
  }

  function getActiveResizeItemAtPosition(x, y) {
    if (!activeItem || !['icon', 'image', 'markup'].includes(activeItem.type)) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bounds = measureItem(ctx, activeItem);
    const handle = getResizeHandleBounds(bounds);
    return isInsideBounds(x, y, handle) ? activeItem : null;
  }

  function startDrag(event) {
    event.preventDefault();
    const pos = getCanvasPosition(event);
    const resizeItem = getActiveResizeItemAtPosition(pos.x, pos.y);
    if (resizeItem) {
      setDrag({
        mode: 'resize',
        id: resizeItem.id,
        startX: pos.x,
        startY: pos.y,
        startSize: resizeItem.size,
        startWidth: resizeItem.width,
        startHeight: resizeItem.height,
      });
      return;
    }

    const item = getItemAtPosition(pos.x, pos.y);
    if (!item) {
      setActiveId(null);
      return;
    }
    setActiveId(item.id);
    syncFormFromItem(item);
    setDrag({ mode: 'move', id: item.id, offsetX: pos.x - item.x, offsetY: pos.y - item.y });
  }

  function moveDrag(event) {
    if (!drag) return;
    event.preventDefault();
    const pos = getCanvasPosition(event);

    if (drag.mode === 'resize') {
      const deltaX = pos.x - drag.startX;
      const deltaY = pos.y - drag.startY;
      const delta = Math.max(deltaX, deltaY);
      const target = items.find(item => item.id === drag.id);
      if (target?.type === 'icon') {
        const size = Math.max(24, Math.round((drag.startSize || target.size) + delta));
        setIconForm(form => ({ ...form, size }));
        setItems(prev => prev.map(item => (item.id === drag.id ? { ...item, size } : item)));
      }
      if (target?.type === 'image') {
        const width = Math.max(50, Math.round((drag.startWidth || target.width) + deltaX));
        const height = Math.max(50, Math.round((drag.startHeight || target.height) + deltaY));
        setImageForm(form => ({ ...form, width, height }));
        setItems(prev => prev.map(item => (item.id === drag.id ? { ...item, width, height } : item)));
      }
      if (target?.type === 'markup') {
        const width = Math.max(180, Math.round((drag.startWidth || target.width) + deltaX));
        const height = Math.max(120, Math.round((drag.startHeight || target.height) + deltaY));
        setItems(prev => prev.map(item => (item.id === drag.id ? { ...item, width, height } : item)));
      }
      return;
    }

    const x = clamp(pos.x - drag.offsetX, 0, canvasSize.width);
    const y = clamp(pos.y - drag.offsetY, 0, canvasSize.height);
    setItems(prev => prev.map(item => (item.id === drag.id ? { ...item, x, y } : item)));
    if (activeItem?.type === 'text') {
      setTextForm(form => ({ ...form, x: Math.round(x), y: Math.round(y) }));
    }
    if (activeItem?.type === 'icon') {
      setIconForm(form => ({ ...form, x: Math.round(x), y: Math.round(y) }));
    }
    if (activeItem?.type === 'image') {
      setImageForm(form => ({ ...form, x: Math.round(x), y: Math.round(y) }));
    }
  }

  function endDrag() {
    setDrag(null);
  }

  function downloadImage() {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert('캔버스 탭에서 PNG 저장을 진행해주세요.');
      return;
    }
    drawCanvas({ showSelection: false });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'klic-canvas.png';
    link.click();
    requestAnimationFrame(() => drawCanvas());
  }

  function downloadMarkupHtml() {
    if (markupItems.length === 0) {
      alert('저장할 마크업이 없습니다.');
      return;
    }
    const body = markupItems.map(item => item.html.trim()).filter(Boolean).join('\n\n');
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KL캔버스 마크업</title>
</head>
<body>
${body}
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kl-canvas-markup.html';
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetCanvas() {
    setCanvasSize(DEFAULT_SIZE);
    setBgColor('#ffffff');
    setBgImage(null);
    setItems([]);
    setActiveId(null);
    setDrag(null);
    setTextForm(createInitialTextForm());
    setIconForm({ value: '', size: 64, color: '#000000', x: 400, y: 300 });
    setImageForm({ image: null, width: 200, height: 200, x: 400, y: 300 });
    setMarkupForm(createInitialMarkupForm());
    setWorkspaceTab('canvas');
    if (bgInputRef.current) bgInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  return (
    <main className="canvas-editor-page">
      <div className="canvas-editor-header">
        <h2 className="crawl-title">KL캔버스</h2>
        <p className="crawl-desc">
          교사와 교직원이 팝업, 비주얼, 가정통신문, 공지 등에 필요한 이미지를 손쉽게 만들 수 있도록 돕는 제작 도구입니다.
        </p>
      </div>

      <div className="canvas-editor-content">
        <aside className="canvas-editor-sidebar">
          <section className={`canvas-panel ${openPanel === 'text' ? 'is-open' : ''}`}>
            <button type="button" className="canvas-panel-toggle" onClick={() => togglePanel('text')} aria-expanded={openPanel === 'text'}>
              <span>텍스트</span>
              <span aria-hidden="true">{openPanel === 'text' ? '−' : '+'}</span>
            </button>
            {openPanel === 'text' && (
              <div className="canvas-panel-body">
                <textarea
                  value={textForm.value}
                  onChange={event => updateActiveText({ value: event.target.value })}
                  placeholder="텍스트 입력"
                  rows={3}
                />
                <label>
                  폰트
                  <select value={textForm.font} onChange={event => updateActiveText({ font: event.target.value })}>
                    {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                  </select>
                </label>
                <div className="canvas-format-row" aria-label="텍스트 서식">
                  <button type="button" className={textForm.bold ? 'is-active' : ''} onClick={() => updateActiveText({ bold: !textForm.bold })}>B</button>
                  <button type="button" className={textForm.italic ? 'is-active' : ''} onClick={() => updateActiveText({ italic: !textForm.italic })}>I</button>
                  <button type="button" className={textForm.underline ? 'is-active' : ''} onClick={() => updateActiveText({ underline: !textForm.underline })}>U</button>
                </div>
                <div className="canvas-form-grid">
                  <label>크기<input type="number" min="12" value={textForm.size} onChange={event => updateActiveText({ size: event.target.value })} /></label>
                  <label className="canvas-color-picker">
                    색
                    <span style={{ backgroundColor: textForm.color }} />
                    <input type="color" value={textForm.color} onChange={event => updateActiveText({ color: event.target.value })} />
                  </label>
                  <label>X<input type="number" min="0" value={textForm.x} onChange={event => updateActiveText({ x: event.target.value })} /></label>
                  <label>Y<input type="number" min="0" value={textForm.y} onChange={event => updateActiveText({ y: event.target.value })} /></label>
                </div>
                <button type="button" className="canvas-primary-btn" onClick={addText}>텍스트 추가</button>
              </div>
            )}
          </section>

          <section className={`canvas-panel ${openPanel === 'icon' ? 'is-open' : ''}`}>
            <button type="button" className="canvas-panel-toggle" onClick={() => togglePanel('icon')} aria-expanded={openPanel === 'icon'}>
              <span>아이콘</span>
              <span aria-hidden="true">{openPanel === 'icon' ? '−' : '+'}</span>
            </button>
            {openPanel === 'icon' && (
              <div className="canvas-panel-body">
                <div className="canvas-icon-grid" aria-label="아이콘 선택">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon.label}
                      type="button"
                      className={iconForm.value === icon.value ? 'is-active' : ''}
                      onClick={() => setIconForm(form => ({ ...form, value: icon.value }))}
                      aria-pressed={iconForm.value === icon.value}
                      title={icon.label}
                    >
                      <span>{icon.value}</span>
                    </button>
                  ))}
                </div>
                {iconForm.value && (
                  <div className="canvas-icon-settings">
                    <div className="canvas-form-grid">
                      <label>크기<input type="number" min="24" value={iconForm.size} onChange={event => setIconForm(form => ({ ...form, size: event.target.value }))} /></label>
                      <label className="canvas-color-picker">
                        색
                        <span style={{ backgroundColor: iconForm.color }} />
                        <input type="color" value={iconForm.color} onChange={event => setIconForm(form => ({ ...form, color: event.target.value }))} />
                      </label>
                      <label>X<input type="number" min="0" value={iconForm.x} onChange={event => setIconForm(form => ({ ...form, x: event.target.value }))} /></label>
                      <label>Y<input type="number" min="0" value={iconForm.y} onChange={event => setIconForm(form => ({ ...form, y: event.target.value }))} /></label>
                    </div>
                    <button type="button" className="canvas-primary-btn" onClick={addIcon}>아이콘 추가</button>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className={`canvas-panel ${openPanel === 'image' ? 'is-open' : ''}`}>
            <button type="button" className="canvas-panel-toggle" onClick={() => togglePanel('image')} aria-expanded={openPanel === 'image'}>
              <span>이미지</span>
              <span aria-hidden="true">{openPanel === 'image' ? '−' : '+'}</span>
            </button>
            {openPanel === 'image' && (
              <div className="canvas-panel-body">
                <label>
                  오버레이 이미지
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={event => loadImageFile(event.target.files[0], image => setImageForm(form => ({ ...form, image })))}
                  />
                </label>
                <div className="canvas-form-grid">
                  <label>넓이<input type="number" min="50" value={imageForm.width} onChange={event => setImageForm(form => ({ ...form, width: event.target.value }))} /></label>
                  <label>높이<input type="number" min="50" value={imageForm.height} onChange={event => setImageForm(form => ({ ...form, height: event.target.value }))} /></label>
                  <label>X<input type="number" min="0" value={imageForm.x} onChange={event => setImageForm(form => ({ ...form, x: event.target.value }))} /></label>
                  <label>Y<input type="number" min="0" value={imageForm.y} onChange={event => setImageForm(form => ({ ...form, y: event.target.value }))} /></label>
                </div>
                <button type="button" className="canvas-primary-btn" onClick={addImage}>이미지 추가</button>
              </div>
            )}
          </section>

          <section className={`canvas-panel ${openPanel === 'markup' ? 'is-open' : ''}`}>
            <button type="button" className="canvas-panel-toggle" onClick={() => togglePanel('markup')} aria-expanded={openPanel === 'markup'}>
              <span>마크업</span>
              <span aria-hidden="true">{openPanel === 'markup' ? '−' : '+'}</span>
            </button>
            {openPanel === 'markup' && (
              <div className="canvas-panel-body">
                <label>
                  유형
                  <select
                    value={markupForm.category}
                    onChange={event => setMarkupForm({ category: event.target.value, templateId: '' })}
                  >
                    {MARKUP_CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </label>
                <div className="canvas-markup-template-grid" aria-label="마크업 모양 선택">
                  {selectedMarkupTemplates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      className={markupForm.templateId === template.id ? 'is-active' : ''}
                      onClick={() => {
                        setMarkupForm(form => ({ ...form, templateId: template.id }));
                        addMarkup(template);
                      }}
                    >
                      <span className={`canvas-markup-thumb canvas-markup-thumb--${template.preview}`} aria-hidden="true">
                        <i /><i /><i /><i /><i /><i />
                      </span>
                      <strong>{template.label}</strong>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </aside>

        <section className="canvas-workspace">
          <div className="canvas-topbar">
            <label>가로<input type="number" min="100" value={canvasSize.width} onChange={event => handleCanvasSizeChange('width', event.target.value)} /></label>
            <label>세로<input type="number" min="100" value={canvasSize.height} onChange={event => handleCanvasSizeChange('height', event.target.value)} /></label>
            <label className="canvas-color-picker">
              배경색
              <span style={{ backgroundColor: bgColor }} />
              <input type="color" value={bgColor} onChange={event => { setBgColor(event.target.value); setBgImage(null); }} />
            </label>
            <label>
              배경 이미지
              <input ref={bgInputRef} type="file" accept="image/*" onChange={event => loadImageFile(event.target.files[0], setBgImage)} />
            </label>
          </div>

          {markupItems.length > 0 && (
            <div className="canvas-workspace-tabs" role="tablist" aria-label="캔버스 보기 전환">
              <button
                type="button"
                className={workspaceTab === 'canvas' ? 'is-active' : ''}
                onClick={() => setWorkspaceTab('canvas')}
              >
                캔버스
              </button>
              <button
                type="button"
                className={workspaceTab === 'markup' ? 'is-active' : ''}
                onClick={() => setWorkspaceTab('markup')}
              >
                마크업
              </button>
            </div>
          )}

          {workspaceTab === 'markup' && activeMarkupItem ? (
            <div className="canvas-markup-editor">
              <div className="canvas-markup-editor-header">
                <strong>{activeMarkupItem.label}</strong>
                <select
                  value={activeMarkupItem.id}
                  onChange={event => setActiveId(event.target.value)}
                >
                  {markupItems.map((item, index) => (
                    <option key={item.id} value={item.id}>{index + 1}. {item.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={activeMarkupItem.html}
                onChange={event => updateActiveMarkupHtml(event.target.value)}
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="canvas-stage">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrag}
                onMouseMove={moveDrag}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                className={drag?.mode === 'resize' ? 'is-resizing' : drag ? 'is-dragging' : ''}
              />
            </div>
          )}

          <div className="canvas-actions">
            <button type="button" onClick={downloadImage}>PNG 저장</button>
            {markupItems.length > 0 && (
              <button type="button" onClick={downloadMarkupHtml}>HTML 저장</button>
            )}
            <button type="button" onClick={resetCanvas}>초기화</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default CanvasEditorPage;
