import type { Theme } from '@/context/themes/types';

const CONTRAST_JUMP_KEYS: Record<string, Array<keyof Theme>> = {
  'Text on Background': ['text', 'bg'],
  'Primary Contrast on Primary': ['primaryContrast', 'primary'],
  'Text Dark on Background': ['textDark', 'bg'],
  'Primary Contrast on Surface Dark': ['primaryContrast', 'surfaceDark'],
  'Text on Surface': ['text', 'surface'],
  'Code Text on Code Background': ['codeText', 'codeBg'],
  'Link on Background': ['link', 'bg'],
  'Blog Link on Background': ['blogLink', 'bg'],
  'Primary Contrast on Footer Background': ['primaryContrast', 'footerBg'],
  'Accent Alt on Footer Background': ['accentAlt', 'footerBg'],
  'Card Link (Link) on Card Background': ['link', 'bg'],
  'Author Role Text (75% opacity) on Surface Background': ['text', 'surface'],
  'Date Text (75% opacity) on Card Background': ['text', 'bg'],
  'Excerpt Text (80% opacity) on Card Background': ['text', 'bg'],
  'Footer Text Muted on Footer Background': ['footerTextMuted', 'footerBg'],
  'Footer Text Subtle on Footer Background': ['footerTextSubtle', 'footerBg'],
  'Primary Contrast on Footer Social Background': ['primaryContrast', 'footerSocialBg'],
  'Category Link on Blog Card Background': ['footerTextMuted', 'surfaceDark'],
  'Text Dark on Author Box Gradient': ['textDark', 'authorBoxStart', 'authorBoxEnd'],
  'Text on Author Box Gradient': ['text', 'authorBoxStart', 'authorBoxEnd'],
  'Blog Link on Author Box Gradient': ['blogLink', 'authorBoxStart', 'authorBoxEnd'],
  'Text on Related Section Gradient': ['text', 'relatedSectionStart', 'relatedSectionEnd'],
  'Accent on Hero Gradient': ['accent', 'heroStart', 'heroEnd'],
};

export function colorControlElementId(key: string): string {
  return `color-item-${key}`;
}

export function scrollToColorControl(key: string | undefined, isExpanded: boolean): void {
  if (!isExpanded || !key) {
    return;
  }
  const item = document.getElementById(colorControlElementId(key));
  if (!item) {
    return;
  }
  item.scrollIntoView({ block: 'nearest' });
}

export function jumpTargetsForIssue(
  pair: string,
  availableKeys: ReadonlySet<string>,
): Array<keyof Theme> {
  const keys = CONTRAST_JUMP_KEYS[pair];
  if (!keys) {
    return [];
  }
  return keys.filter((key) => availableKeys.has(key));
}

export const CONTRAST_REVIEW_STORAGE_KEY = 'contrast-review-pair';

const BLOG_POST_EXAMPLE = '/resources/blog/reusable-vs-feature-specific-components';
const HEADER_OFFSET = 110;

type ContrastPageExample = {
  selectors: string[];
  path: string;
};

const CONTRAST_PAGE_EXAMPLES: Record<string, ContrastPageExample> = {
  'Text on Background': { selectors: ['[data-contrast-example="body"]'], path: '/' },
  'Primary Contrast on Primary': { selectors: ['[data-contrast-example="primary-button"]'], path: '/' },
  'Text Dark on Background': { selectors: ['[data-contrast-example="header"]'], path: '/' },
  'Primary Contrast on Surface Dark': { selectors: ['[data-contrast-example="blog-hero"]'], path: BLOG_POST_EXAMPLE },
  'Text on Surface': { selectors: ['[data-contrast-example="surface"]'], path: '/' },
  'Code Text on Code Background': {
    selectors: ['[data-contrast-example="code"] pre', '[data-contrast-example="code"]'],
    path: BLOG_POST_EXAMPLE,
  },
  'Link on Background': { selectors: ['[data-contrast-example="page-link"]'], path: '/' },
  'Blog Link on Background': { selectors: ['[data-contrast-example="blog-link"]'], path: BLOG_POST_EXAMPLE },
  'Primary Contrast on Footer Background': { selectors: ['[data-contrast-example="footer"]'], path: '/' },
  'Accent Alt on Footer Background': { selectors: ['[data-contrast-example="footer-heading"]'], path: '/' },
  'Card Link (Link) on Card Background': { selectors: ['[data-contrast-example="latest-blogs"]'], path: '/' },
  'Author Role Text (75% opacity) on Surface Background': { selectors: ['[data-contrast-example="spotlight"]'], path: '/' },
  'Date Text (75% opacity) on Card Background': { selectors: ['[data-contrast-example="latest-blogs"]'], path: '/' },
  'Excerpt Text (80% opacity) on Card Background': { selectors: ['[data-contrast-example="latest-blogs"]'], path: '/' },
  'Footer Text Muted on Footer Background': { selectors: ['[data-contrast-example="footer"]'], path: '/' },
  'Footer Text Subtle on Footer Background': { selectors: ['[data-contrast-example="footer"]'], path: '/' },
  'Primary Contrast on Footer Social Background': { selectors: ['[data-contrast-example="footer-social"]'], path: '/' },
  'Category Link on Blog Card Background': { selectors: ['[data-contrast-example="blog-grid"]'], path: '/resources/blog' },
  'Text Dark on Author Box Gradient': { selectors: ['#author'], path: BLOG_POST_EXAMPLE },
  'Text on Author Box Gradient': { selectors: ['#author'], path: BLOG_POST_EXAMPLE },
  'Blog Link on Author Box Gradient': { selectors: ['#author'], path: BLOG_POST_EXAMPLE },
  'Text on Related Section Gradient': { selectors: ['[data-contrast-example="related"]'], path: BLOG_POST_EXAMPLE },
  'Accent on Hero Gradient': { selectors: ['[data-contrast-example="hero"]'], path: '/' },
};

let navigateToExample: ((_path: string) => void) | null = null;

export function contrastPageExample(pair: string): ContrastPageExample | null {
  return CONTRAST_PAGE_EXAMPLES[pair] ?? null;
}

export function registerContrastNavigator(navigate: (_path: string) => void): void {
  navigateToExample = navigate;
}

export function findContrastExampleElement(pair: string): HTMLElement | null {
  const example = CONTRAST_PAGE_EXAMPLES[pair];
  if (!example) {
    return null;
  }
  const selector = example.selectors.find((candidate) => document.querySelector(candidate));
  const element = selector ? document.querySelector(selector) : null;
  if (!(element instanceof HTMLElement)) {
    return null;
  }
  return element;
}

export function scrollContrastExampleIntoView(element: HTMLElement): void {
  markContrastExample(element);
  const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

export function clearContrastReviewMark(): void {
  document.querySelectorAll('[data-contrast-review]').forEach((node) => {
    node.removeAttribute('data-contrast-review');
  });
}

export function highlightedKeysForOpenIssue(
  pair: string | null,
  keys: readonly string[],
  failingPairs: ReadonlySet<string>,
): string[] {
  if (!pair || !failingPairs.has(pair)) {
    return [];
  }
  return [...keys];
}

function markContrastExample(element: HTMLElement): void {
  clearContrastReviewMark();
  element.setAttribute('data-contrast-review', 'true');
}

function rememberContrastReview(pair: string): void {
  sessionStorage.setItem(CONTRAST_REVIEW_STORAGE_KEY, pair);
}

export function resumeContrastReview(): void {
  const pair = sessionStorage.getItem(CONTRAST_REVIEW_STORAGE_KEY);
  if (!pair) {
    return;
  }
  const startedAt = Date.now();
  const tryScroll = () => {
    const element = findContrastExampleElement(pair);
    if (element) {
      sessionStorage.removeItem(CONTRAST_REVIEW_STORAGE_KEY);
      document.body.style.overflow = '';
      scrollContrastExampleIntoView(element);
      return;
    }
    if (Date.now() - startedAt < 3000) {
      window.setTimeout(tryScroll, 100);
    }
  };
  tryScroll();
}

export function reviewContrastOnPage(pair: string): void {
  document.body.style.overflow = '';
  const element = findContrastExampleElement(pair);
  if (element) {
    sessionStorage.removeItem(CONTRAST_REVIEW_STORAGE_KEY);
    scrollContrastExampleIntoView(element);
    return;
  }
  const example = CONTRAST_PAGE_EXAMPLES[pair];
  if (!example || !navigateToExample) {
    return;
  }
  if (window.location.pathname === example.path) {
    return;
  }
  rememberContrastReview(pair);
  navigateToExample(example.path);
}
