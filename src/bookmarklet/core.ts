export const NAVIGATION_PATTERNS = [
  'siguiente', 'next', 'continue', 'continuar', 'avanzar', 'forward',
  'proceed', 'adelante', 'siguiente pagina', 'next page', 'siguiente paso',
  'next step', 'siguiente leccion', 'next lesson', 'siguiente modulo',
  'siguiente tema', 'siguiente unidad', 'siguiente slide', 'next slide',
  'continue to next', 'go to next', 'ir al siguiente'
];

export const ARROW_PATTERNS = ['→', '›', '»', '>', '▶', '⏭', '⇒'];

export const BUTTON_SELECTORS = [
  'button[class*="next"]',
  'button[class*="siguiente"]',
  'button[class*="continue"]',
  'button[class*="forward"]',
  'a[class*="next"]',
  'a[class*="siguiente"]',
  'a[class*="continue"]',
  '[class*="nav-next"]',
  '[class*="next-button"]',
  '[class*="next-btn"]',
  '[class*="btn-next"]',
  '[class*="continue-button"]',
  '[data-action="next"]',
  '[data-nav="next"]',
  '[aria-label*="next" i]',
  '[aria-label*="siguiente" i]',
  '[aria-label*="continue" i]',
  '[title*="next" i]',
  '[title*="siguiente" i]',
  '.scorm-nav-next',
  '.pagination-next',
  '.next-page',
  '.next-slide',
  '#next-button',
  '#nextButton',
  '#btnNext',
  '.mod_quiz-next-nav',
  '.submitbtns input[name="next"]',
  '.activity-navigation .next',
  '[class*="arrow-right"]',
  '[class*="chevron-right"]'
];

export const CONTENT_SELECTORS = [
  '#region-main',
  '.course-content',
  '.activity-wrapper',
  '.content-wrapper',
  '[role="main"]',
  'main',
  '.main-content',
  '#main-content',
  '.page-content',
  '#content',
  '.scorm-content',
  '.lesson-content',
  '.module-content',
  '.slide-content',
  'article',
  '.article-content'
];

export interface CapturedScreenshot {
  id: number;
  dataUrl: string;
  timestamp: number;
  pageTitle: string;
}

export type ToolStatus = 'idle' | 'running' | 'paused' | 'complete';

export interface ToolConfig {
  delay: number;
  captureFullPage: boolean;
  customNextSelector: string;
  customContentSelector: string;
  maxCaptures: number;
}

export const DEFAULT_CONFIG: ToolConfig = {
  delay: 3000,
  captureFullPage: false,
  customNextSelector: '',
  customContentSelector: '',
  maxCaptures: 500
};
