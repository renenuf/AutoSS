const SCRIPT_VERSION = '1.0.0';

const NAVIGATION_PATTERNS = [
  'siguiente', 'next', 'continue', 'continuar', 'avanzar', 'forward',
  'proceed', 'adelante', 'siguiente pagina', 'next page', 'siguiente paso',
  'next step', 'siguiente leccion', 'next lesson', 'siguiente modulo'
];

const ARROW_PATTERNS = ['→', '›', '»', '>', '▶', '⏭', '⇒'];

const BUTTON_SELECTORS = [
  'button[class*="next"]', 'button[class*="siguiente"]', 'button[class*="continue"]',
  'a[class*="next"]', 'a[class*="siguiente"]', '[class*="nav-next"]',
  '[class*="next-button"]', '[class*="next-btn"]', '[class*="btn-next"]',
  '[data-action="next"]', '[data-nav="next"]', '[aria-label*="next" i]',
  '[aria-label*="siguiente" i]', '[title*="next" i]', '[title*="siguiente" i]',
  '.pagination-next', '.next-page', '#next-button', '#nextButton', '#btnNext',
  '.submitbtns input[name="next"]', '.activity-navigation .next'
];

const CONTENT_SELECTORS = [
  '#region-main', '.course-content', '.activity-wrapper', '.content-wrapper',
  '[role="main"]', 'main', '.main-content', '#main-content', '.page-content',
  '#content', '.lesson-content', '.module-content', 'article'
];

interface Screenshot {
  id: number;
  dataUrl: string;
  timestamp: number;
  title: string;
}

interface State {
  status: 'idle' | 'running' | 'paused' | 'complete';
  screenshots: Screenshot[];
  delay: number;
  customNextSelector: string;
  customContentSelector: string;
  captureFullPage: boolean;
  logs: string[];
}

const state: State = {
  status: 'idle',
  screenshots: [],
  delay: 3000,
  customNextSelector: '',
  customContentSelector: '',
  captureFullPage: false,
  logs: []
};

let timeoutId: number | null = null;

function log(message: string): void {
  const timestamp = new Date().toLocaleTimeString();
  state.logs.push(`[${timestamp}] ${message}`);
  updateLogDisplay();
}

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(script);
  });
}

async function loadDependencies(): Promise<void> {
  log('Loading dependencies...');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  log('Dependencies loaded');
}

function findNextButton(): HTMLElement | null {
  if (state.customNextSelector) {
    const custom = document.querySelector(state.customNextSelector) as HTMLElement;
    if (custom && isVisible(custom)) return custom;
  }

  for (const selector of BUTTON_SELECTORS) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (isVisible(el as HTMLElement) && isClickable(el as HTMLElement)) {
          return el as HTMLElement;
        }
      }
    } catch { /* invalid selector */ }
  }

  const allClickables = document.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"]');
  for (const el of allClickables) {
    const text = (el.textContent || '').toLowerCase().trim();
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    const title = (el.getAttribute('title') || '').toLowerCase();
    const combined = `${text} ${ariaLabel} ${title}`;

    for (const pattern of NAVIGATION_PATTERNS) {
      if (combined.includes(pattern) && isVisible(el as HTMLElement) && isClickable(el as HTMLElement)) {
        return el as HTMLElement;
      }
    }

    for (const arrow of ARROW_PATTERNS) {
      if (text.includes(arrow) && isVisible(el as HTMLElement) && isClickable(el as HTMLElement)) {
        return el as HTMLElement;
      }
    }
  }

  return null;
}

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return style.display !== 'none' &&
         style.visibility !== 'hidden' &&
         style.opacity !== '0' &&
         rect.width > 0 &&
         rect.height > 0;
}

function isClickable(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  return !el.hasAttribute('disabled') &&
         style.pointerEvents !== 'none' &&
         el.getAttribute('aria-disabled') !== 'true';
}

function findContentArea(): HTMLElement {
  if (state.customContentSelector) {
    const custom = document.querySelector(state.customContentSelector) as HTMLElement;
    if (custom) return custom;
  }

  for (const selector of CONTENT_SELECTORS) {
    const el = document.querySelector(selector) as HTMLElement;
    if (el && isVisible(el)) return el;
  }

  return document.body;
}

async function captureScreenshot(): Promise<void> {
  log('Capturing screenshot...');
  const target = state.captureFullPage ? document.body : findContentArea();

  try {
    const html2canvas = (window as unknown as { html2canvas: (el: HTMLElement, opts?: object) => Promise<HTMLCanvasElement> }).html2canvas;
    const canvas = await html2canvas(target, {
      useCORS: true,
      allowTaint: true,
      scale: window.devicePixelRatio || 1,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const screenshot: Screenshot = {
      id: state.screenshots.length + 1,
      dataUrl: canvas.toDataURL('image/png'),
      timestamp: Date.now(),
      title: document.title || `Page ${state.screenshots.length + 1}`
    };

    state.screenshots.push(screenshot);
    updateUI();
    log(`Screenshot ${screenshot.id} captured`);
  } catch (err) {
    log(`Error capturing screenshot: ${err}`);
  }
}

async function clickNext(): Promise<boolean> {
  const btn = findNextButton();
  if (!btn) {
    log('No next button found - end of content');
    return false;
  }

  log(`Clicking: ${btn.textContent?.trim().substring(0, 30) || 'Next button'}`);
  btn.click();
  return true;
}

function waitForPageLoad(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, state.delay);
  });
}

async function runAutomation(): Promise<void> {
  if (state.status !== 'running') return;

  await captureScreenshot();

  const hasNext = await clickNext();
  if (!hasNext) {
    state.status = 'complete';
    updateUI();
    log('Automation complete - no more pages');
    return;
  }

  log(`Waiting ${state.delay / 1000}s for page load...`);
  await waitForPageLoad();

  if (state.status === 'running') {
    timeoutId = window.setTimeout(() => runAutomation(), 100);
  }
}

function start(): void {
  if (state.status === 'running') return;
  state.status = 'running';
  log('Starting automation');
  updateUI();
  runAutomation();
}

function pause(): void {
  if (state.status !== 'running') return;
  state.status = 'paused';
  if (timeoutId) clearTimeout(timeoutId);
  log('Automation paused');
  updateUI();
}

function resume(): void {
  if (state.status !== 'paused') return;
  state.status = 'running';
  log('Resuming automation');
  updateUI();
  runAutomation();
}

function stop(): void {
  state.status = 'idle';
  if (timeoutId) clearTimeout(timeoutId);
  log('Automation stopped');
  updateUI();
}

async function exportAsZip(): Promise<void> {
  if (state.screenshots.length === 0) {
    alert('No screenshots to export');
    return;
  }

  log('Creating ZIP file...');
  const JSZip = (window as unknown as { JSZip: new () => { file: (name: string, data: string, opts?: object) => void; generateAsync: (opts: object) => Promise<Blob> } }).JSZip;
  const zip = new JSZip();

  for (const ss of state.screenshots) {
    const base64 = ss.dataUrl.split(',')[1];
    const filename = `${String(ss.id).padStart(3, '0')}_${ss.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.png`;
    zip.file(filename, base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `course_screenshots_${Date.now()}.zip`);
  log('ZIP exported successfully');
}

async function exportAsPdf(): Promise<void> {
  if (state.screenshots.length === 0) {
    alert('No screenshots to export');
    return;
  }

  log('Creating PDF file...');
  const jspdf = (window as unknown as { jspdf: { jsPDF: new (opts: object) => { internal: { pageSize: { getWidth: () => number; getHeight: () => number } }; addImage: (data: string, format: string, x: number, y: number, w: number, h: number) => void; addPage: () => void; save: (name: string) => void } } }).jspdf;
  const pdf = new jspdf.jsPDF({ orientation: 'landscape', unit: 'px' });

  for (let i = 0; i < state.screenshots.length; i++) {
    if (i > 0) pdf.addPage();
    const ss = state.screenshots[i];
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(ss.dataUrl, 'PNG', 0, 0, pageWidth, pageHeight);
  }

  pdf.save(`course_screenshots_${Date.now()}.pdf`);
  log('PDF exported successfully');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createPanel(): HTMLElement {
  const existing = document.getElementById('course-capture-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'course-capture-panel';
  panel.innerHTML = `
    <style>
      #course-capture-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        background: #1a1a2e;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 2147483647;
        color: #fff;
        overflow: hidden;
      }
      #course-capture-panel * {
        box-sizing: border-box;
      }
      .ccp-header {
        background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
        padding: 12px 16px;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #2a2a4a;
      }
      .ccp-title {
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ccp-close {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
        line-height: 1;
      }
      .ccp-close:hover {
        color: #ff6b6b;
      }
      .ccp-body {
        padding: 16px;
      }
      .ccp-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        padding: 8px 12px;
        background: #2a2a4a;
        border-radius: 8px;
        font-size: 13px;
      }
      .ccp-status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #888;
      }
      .ccp-status-dot.idle { background: #888; }
      .ccp-status-dot.running { background: #4ade80; animation: pulse 1s infinite; }
      .ccp-status-dot.paused { background: #fbbf24; }
      .ccp-status-dot.complete { background: #60a5fa; }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .ccp-counter {
        font-size: 24px;
        font-weight: 700;
        text-align: center;
        margin-bottom: 16px;
        color: #60a5fa;
      }
      .ccp-counter span {
        font-size: 12px;
        color: #888;
        display: block;
        font-weight: 400;
      }
      .ccp-controls {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 16px;
      }
      .ccp-btn {
        padding: 10px 16px;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .ccp-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .ccp-btn-primary {
        background: #3b82f6;
        color: white;
      }
      .ccp-btn-primary:hover:not(:disabled) {
        background: #2563eb;
      }
      .ccp-btn-secondary {
        background: #374151;
        color: white;
      }
      .ccp-btn-secondary:hover:not(:disabled) {
        background: #4b5563;
      }
      .ccp-btn-success {
        background: #059669;
        color: white;
      }
      .ccp-btn-success:hover:not(:disabled) {
        background: #047857;
      }
      .ccp-btn-danger {
        background: #dc2626;
        color: white;
      }
      .ccp-btn-danger:hover:not(:disabled) {
        background: #b91c1c;
      }
      .ccp-settings {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #2a2a4a;
      }
      .ccp-settings-toggle {
        background: none;
        border: none;
        color: #60a5fa;
        cursor: pointer;
        font-size: 12px;
        padding: 0;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .ccp-settings-content {
        margin-top: 12px;
        display: none;
      }
      .ccp-settings-content.open {
        display: block;
      }
      .ccp-input-group {
        margin-bottom: 12px;
      }
      .ccp-label {
        font-size: 11px;
        color: #888;
        margin-bottom: 4px;
        display: block;
      }
      .ccp-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #2a2a4a;
        border-radius: 6px;
        background: #16213e;
        color: #fff;
        font-size: 13px;
      }
      .ccp-input:focus {
        outline: none;
        border-color: #3b82f6;
      }
      .ccp-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        cursor: pointer;
      }
      .ccp-checkbox input {
        width: 16px;
        height: 16px;
      }
      .ccp-log {
        margin-top: 12px;
        max-height: 100px;
        overflow-y: auto;
        background: #0d1117;
        border-radius: 6px;
        padding: 8px;
        font-family: monospace;
        font-size: 10px;
        color: #7ee787;
      }
      .ccp-log::-webkit-scrollbar {
        width: 4px;
      }
      .ccp-log::-webkit-scrollbar-thumb {
        background: #374151;
        border-radius: 2px;
      }
      .ccp-preview {
        margin-top: 12px;
      }
      .ccp-preview-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
        max-height: 80px;
        overflow-y: auto;
      }
      .ccp-preview-thumb {
        aspect-ratio: 16/9;
        background: #2a2a4a;
        border-radius: 4px;
        overflow: hidden;
      }
      .ccp-preview-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    </style>
    <div class="ccp-header">
      <div class="ccp-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        Course Capture
      </div>
      <button class="ccp-close" id="ccp-close">&times;</button>
    </div>
    <div class="ccp-body">
      <div class="ccp-status">
        <div class="ccp-status-dot idle" id="ccp-status-dot"></div>
        <span id="ccp-status-text">Ready</span>
      </div>
      <div class="ccp-counter">
        <span id="ccp-count">0</span>
        <span>screenshots captured</span>
      </div>
      <div class="ccp-controls">
        <button class="ccp-btn ccp-btn-primary" id="ccp-start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Start
        </button>
        <button class="ccp-btn ccp-btn-secondary" id="ccp-pause" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          Pause
        </button>
        <button class="ccp-btn ccp-btn-danger" id="ccp-stop" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
          Stop
        </button>
        <button class="ccp-btn ccp-btn-secondary" id="ccp-capture">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>
          Capture
        </button>
      </div>
      <div class="ccp-controls">
        <button class="ccp-btn ccp-btn-success" id="ccp-zip" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          ZIP
        </button>
        <button class="ccp-btn ccp-btn-success" id="ccp-pdf" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          PDF
        </button>
      </div>
      <div class="ccp-settings">
        <button class="ccp-settings-toggle" id="ccp-settings-toggle">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </button>
        <div class="ccp-settings-content" id="ccp-settings-content">
          <div class="ccp-input-group">
            <label class="ccp-label">Delay between pages (ms)</label>
            <input type="number" class="ccp-input" id="ccp-delay" value="3000" min="1000" max="30000" step="500">
          </div>
          <div class="ccp-input-group">
            <label class="ccp-label">Custom Next Button Selector (optional)</label>
            <input type="text" class="ccp-input" id="ccp-next-selector" placeholder=".my-next-button">
          </div>
          <div class="ccp-input-group">
            <label class="ccp-label">Custom Content Selector (optional)</label>
            <input type="text" class="ccp-input" id="ccp-content-selector" placeholder="#main-content">
          </div>
          <label class="ccp-checkbox">
            <input type="checkbox" id="ccp-full-page">
            Capture full page (scroll)
          </label>
        </div>
      </div>
      <div class="ccp-preview" id="ccp-preview" style="display:none;">
        <div class="ccp-label">Recent captures</div>
        <div class="ccp-preview-grid" id="ccp-preview-grid"></div>
      </div>
      <div class="ccp-log" id="ccp-log"></div>
    </div>
  `;

  return panel;
}

function initDragging(panel: HTMLElement): void {
  const header = panel.querySelector('.ccp-header') as HTMLElement;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  header.addEventListener('mousedown', (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('ccp-close')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = panel.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
  });

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.left = `${startLeft + dx}px`;
    panel.style.top = `${startTop + dy}px`;
    panel.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

function updateUI(): void {
  const statusDot = document.getElementById('ccp-status-dot');
  const statusText = document.getElementById('ccp-status-text');
  const count = document.getElementById('ccp-count');
  const startBtn = document.getElementById('ccp-start') as HTMLButtonElement;
  const pauseBtn = document.getElementById('ccp-pause') as HTMLButtonElement;
  const stopBtn = document.getElementById('ccp-stop') as HTMLButtonElement;
  const zipBtn = document.getElementById('ccp-zip') as HTMLButtonElement;
  const pdfBtn = document.getElementById('ccp-pdf') as HTMLButtonElement;
  const preview = document.getElementById('ccp-preview');
  const previewGrid = document.getElementById('ccp-preview-grid');

  if (statusDot) {
    statusDot.className = `ccp-status-dot ${state.status}`;
  }

  if (statusText) {
    const texts: Record<string, string> = {
      idle: 'Ready',
      running: 'Running...',
      paused: 'Paused',
      complete: 'Complete'
    };
    statusText.textContent = texts[state.status];
  }

  if (count) {
    count.textContent = String(state.screenshots.length);
  }

  if (startBtn) {
    startBtn.disabled = state.status === 'running';
    startBtn.textContent = state.status === 'paused' ? 'Resume' : 'Start';
  }

  if (pauseBtn) {
    pauseBtn.disabled = state.status !== 'running';
  }

  if (stopBtn) {
    stopBtn.disabled = state.status === 'idle' || state.status === 'complete';
  }

  const hasScreenshots = state.screenshots.length > 0;
  if (zipBtn) zipBtn.disabled = !hasScreenshots;
  if (pdfBtn) pdfBtn.disabled = !hasScreenshots;

  if (preview && previewGrid && hasScreenshots) {
    preview.style.display = 'block';
    const recent = state.screenshots.slice(-8);
    previewGrid.innerHTML = recent.map(ss =>
      `<div class="ccp-preview-thumb"><img src="${ss.dataUrl}" alt="Screenshot ${ss.id}"></div>`
    ).join('');
  }
}

function updateLogDisplay(): void {
  const logEl = document.getElementById('ccp-log');
  if (logEl) {
    logEl.innerHTML = state.logs.slice(-10).join('<br>');
    logEl.scrollTop = logEl.scrollHeight;
  }
}

function bindEvents(panel: HTMLElement): void {
  panel.querySelector('#ccp-close')?.addEventListener('click', () => {
    stop();
    panel.remove();
  });

  panel.querySelector('#ccp-start')?.addEventListener('click', () => {
    if (state.status === 'paused') {
      resume();
    } else {
      start();
    }
  });

  panel.querySelector('#ccp-pause')?.addEventListener('click', pause);
  panel.querySelector('#ccp-stop')?.addEventListener('click', stop);

  panel.querySelector('#ccp-capture')?.addEventListener('click', () => {
    captureScreenshot();
  });

  panel.querySelector('#ccp-zip')?.addEventListener('click', exportAsZip);
  panel.querySelector('#ccp-pdf')?.addEventListener('click', exportAsPdf);

  panel.querySelector('#ccp-settings-toggle')?.addEventListener('click', () => {
    const content = document.getElementById('ccp-settings-content');
    content?.classList.toggle('open');
  });

  panel.querySelector('#ccp-delay')?.addEventListener('change', (e) => {
    state.delay = parseInt((e.target as HTMLInputElement).value) || 3000;
    log(`Delay set to ${state.delay}ms`);
  });

  panel.querySelector('#ccp-next-selector')?.addEventListener('change', (e) => {
    state.customNextSelector = (e.target as HTMLInputElement).value;
    log(`Custom next selector: ${state.customNextSelector || 'none'}`);
  });

  panel.querySelector('#ccp-content-selector')?.addEventListener('change', (e) => {
    state.customContentSelector = (e.target as HTMLInputElement).value;
    log(`Custom content selector: ${state.customContentSelector || 'none'}`);
  });

  panel.querySelector('#ccp-full-page')?.addEventListener('change', (e) => {
    state.captureFullPage = (e.target as HTMLInputElement).checked;
    log(`Full page capture: ${state.captureFullPage ? 'enabled' : 'disabled'}`);
  });
}

async function init(): Promise<void> {
  const panel = createPanel();
  document.body.appendChild(panel);
  initDragging(panel);
  bindEvents(panel);
  await loadDependencies();
  log('Course Capture ready');
  updateUI();
}

init();

export {};
