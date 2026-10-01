import { describe, expect, it, vi } from 'vitest';
import {
  CONTRAST_REVIEW_STORAGE_KEY,
  clearContrastReviewMark,
  contrastPageExample,
  highlightedKeysForOpenIssue,
  jumpTargetsForIssue,
  registerContrastNavigator,
  reviewContrastOnPage,
} from '@/utils/contrastJump';

const panelKeys = new Set([
  'bg',
  'surface',
  'surfaceDark',
  'text',
  'textDark',
  'codeBg',
  'codeText',
  'primary',
  'primaryContrast',
  'blogLink',
  'accent',
  'accentAlt',
  'footerBg',
  'footerTextMuted',
  'footerTextSubtle',
  'footerSocialBg',
  'heroStart',
  'heroEnd',
  'authorBoxStart',
  'authorBoxEnd',
  'relatedSectionStart',
  'relatedSectionEnd',
]);

describe('jumpTargetsForIssue', () => {
  it('returns the foreground and background controls for a simple pair', () => {
    expect(jumpTargetsForIssue('Text on Background', panelKeys)).toEqual(['text', 'bg']);
  });

  it('includes the gradient stops for a gradient pair', () => {
    expect(jumpTargetsForIssue('Accent on Hero Gradient', panelKeys)).toEqual([
      'accent',
      'heroStart',
      'heroEnd',
    ]);
  });

  it('drops controls that are not in the color panel', () => {
    expect(jumpTargetsForIssue('Link on Background', panelKeys)).toEqual(['bg']);
  });

  it('returns nothing for an unknown warning', () => {
    expect(jumpTargetsForIssue('text on bg', panelKeys)).toEqual([]);
  });
});

describe('reviewContrastOnPage', () => {
  it('scrolls the matching page section into view', () => {
    const hero = document.createElement('section');
    hero.setAttribute('data-contrast-example', 'hero');
    document.body.appendChild(hero);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    reviewContrastOnPage('Accent on Hero Gradient');

    expect(scrollTo).toHaveBeenCalled();
    expect(hero.getAttribute('data-contrast-review')).toBe('true');
    expect(sessionStorage.getItem(CONTRAST_REVIEW_STORAGE_KEY)).toBeNull();
    clearContrastReviewMark();
    expect(hero.hasAttribute('data-contrast-review')).toBe(false);
    hero.remove();
    scrollTo.mockRestore();
  });

  it('keeps color outlines only while that warning is still failing', () => {
    const failing = new Set(['Accent on Hero Gradient']);
    expect(highlightedKeysForOpenIssue('Accent on Hero Gradient', ['accent', 'heroStart'], failing)).toEqual([
      'accent',
      'heroStart',
    ]);
    expect(highlightedKeysForOpenIssue('Accent on Hero Gradient', ['accent'], new Set())).toEqual([]);
    expect(highlightedKeysForOpenIssue(null, ['accent'], failing)).toEqual([]);
  });

  it('moves the review box onto the latest page section', () => {
    const hero = document.createElement('section');
    const footer = document.createElement('footer');
    hero.setAttribute('data-contrast-example', 'hero');
    footer.setAttribute('data-contrast-example', 'footer');
    document.body.append(hero, footer);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    reviewContrastOnPage('Accent on Hero Gradient');
    reviewContrastOnPage('Primary Contrast on Footer Background');

    expect(hero.hasAttribute('data-contrast-review')).toBe(false);
    expect(footer.getAttribute('data-contrast-review')).toBe('true');
    hero.remove();
    footer.remove();
  });

  it('opens the page that contains an example missing from the current page', () => {
    const navigate = vi.fn();
    registerContrastNavigator(navigate);

    reviewContrastOnPage('Text on Author Box Gradient');

    expect(navigate).toHaveBeenCalledWith('/resources/blog/reusable-vs-feature-specific-components');
    expect(sessionStorage.getItem(CONTRAST_REVIEW_STORAGE_KEY)).toBe('Text on Author Box Gradient');
    expect(contrastPageExample('Code Text on Code Background')?.path).toContain('/resources/blog/');
    sessionStorage.removeItem(CONTRAST_REVIEW_STORAGE_KEY);
    registerContrastNavigator(() => undefined);
  });
});
