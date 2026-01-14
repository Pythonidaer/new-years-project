import Color from 'color';

/**
 * Blend a semi-transparent color with a background color
 * Returns the resulting solid color
 */
function blendColor(foreground: string, background: string): string {
  try {
    const fg = Color(foreground);
    const bg = Color(background);
    
    // If foreground is already opaque, return as-is
    if (fg.alpha() >= 1) {
      return foreground;
    }
    
    // Blend: result = fg * alpha + bg * (1 - alpha)
    const alpha = fg.alpha();
    const r = Math.round(fg.red() * alpha + bg.red() * (1 - alpha));
    const g = Math.round(fg.green() * alpha + bg.green() * (1 - alpha));
    const b = Math.round(fg.blue() * alpha + bg.blue() * (1 - alpha));
    
    return `rgb(${r}, ${g}, ${b})`;
  } catch (error) {
    console.warn('Failed to blend color:', error);
    return foreground; // Fallback to original
  }
}

/**
 * Calculate WCAG contrast ratio between two colors
 * Returns a number between 1 (same color) and 21 (maximum contrast)
 * AA standard: 4.5:1 for normal text, 7:1 for large text
 * AAA standard: 7:1 for normal text
 */
export function getContrastRatio(color1: string, color2: string): number {
  try {
    const c1 = Color(color1);
    const c2 = Color(color2);
    return c1.contrast(c2);
  } catch (error) {
    console.warn('Failed to calculate contrast ratio:', error);
    return 1; // Return minimum contrast on error
  }
}

/**
 * Get WCAG contrast level
 * Returns 'AAA', 'AA', or 'Fail'
 */
export function getContrastLevel(ratio: number): 'AAA' | 'AA' | 'Fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
}

/**
 * Check for contrast issues in a theme
 * Returns array of contrast warnings
 */
export type ContrastIssue = {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  level: 'AAA' | 'AA' | 'Fail';
  usage: string; // Where this color combination is used
};

export function checkContrastIssues(theme: {
  bg: string;
  text: string;
  primary: string;
  primaryContrast: string;
  surface: string;
  surfaceDark: string;
  textDark: string;
  link: string;
  footerBg: string;
  footerTextMuted: string;
  footerTextSubtle: string;
  footerSocialBg: string;
  accentAlt: string;
  codeBg: string;
  codeText: string;
  blogLink: string;
  authorBoxStart: string;
  authorBoxEnd: string;
  relatedSectionStart: string;
  relatedSectionEnd: string;
}): ContrastIssue[] {
  const issues: ContrastIssue[] = [];

  // Check text on background (includes headings on Blogs/Categories pages)
  const textBgRatio = getContrastRatio(theme.text, theme.bg);
  if (textBgRatio < 4.5) {
    issues.push({
      pair: 'Text on Background',
      foreground: theme.text,
      background: theme.bg,
      ratio: textBgRatio,
      level: getContrastLevel(textBgRatio),
      usage: 'Body text, headings (Blogs page, Categories page), main content areas',
    });
  }

  // Check primary on contrast (for buttons)
  const primaryContrastRatio = getContrastRatio(theme.primaryContrast, theme.primary);
  if (primaryContrastRatio < 4.5) {
    issues.push({
      pair: 'Primary Contrast on Primary',
      foreground: theme.primaryContrast,
      background: theme.primary,
      ratio: primaryContrastRatio,
      level: getContrastLevel(primaryContrastRatio),
      usage: 'Primary buttons, CTAs',
    });
  }

  // Check text dark on background (for header scrolled state and blog heading)
  const textDarkBgRatio = getContrastRatio(theme.textDark, theme.bg);
  if (textDarkBgRatio < 4.5) {
    issues.push({
      pair: 'Text Dark on Background',
      foreground: theme.textDark,
      background: theme.bg,
      ratio: textDarkBgRatio,
      level: getContrastLevel(textDarkBgRatio),
      usage: 'Header (scrolled state), Blog heading on white background',
    });
  }

  // Check primary contrast on surface dark (for blog post hero)
  const primaryContrastSurfaceDarkRatio = getContrastRatio(theme.primaryContrast, theme.surfaceDark);
  if (primaryContrastSurfaceDarkRatio < 4.5) {
    issues.push({
      pair: 'Primary Contrast on Surface Dark',
      foreground: theme.primaryContrast,
      background: theme.surfaceDark,
      ratio: primaryContrastSurfaceDarkRatio,
      level: getContrastLevel(primaryContrastSurfaceDarkRatio),
      usage: 'Blog post hero section, Header (dark variant)',
    });
  }

  // Check text on surface
  const textSurfaceRatio = getContrastRatio(theme.text, theme.surface);
  if (textSurfaceRatio < 4.5) {
    issues.push({
      pair: 'Text on Surface',
      foreground: theme.text,
      background: theme.surface,
      ratio: textSurfaceRatio,
      level: getContrastLevel(textSurfaceRatio),
      usage: 'Cards, elevated surfaces',
    });
  }

  // Check code text on code background
  const codeTextCodeBgRatio = getContrastRatio(theme.codeText, theme.codeBg);
  if (codeTextCodeBgRatio < 4.5) {
    issues.push({
      pair: 'Code Text on Code Background',
      foreground: theme.codeText,
      background: theme.codeBg,
      ratio: codeTextCodeBgRatio,
      level: getContrastLevel(codeTextCodeBgRatio),
      usage: 'Code blocks, inline code',
    });
  }

  // Check link on background
  const linkBgRatio = getContrastRatio(theme.link, theme.bg);
  if (linkBgRatio < 4.5) {
    issues.push({
      pair: 'Link on Background',
      foreground: theme.link,
      background: theme.bg,
      ratio: linkBgRatio,
      level: getContrastLevel(linkBgRatio),
      usage: 'Hyperlinks on page background',
    });
  }

  // Check blog link on background (for post content links and tag links)
  const blogLinkBgRatio = getContrastRatio(theme.blogLink, theme.bg);
  if (blogLinkBgRatio < 4.5) {
    issues.push({
      pair: 'Blog Link on Background',
      foreground: theme.blogLink,
      background: theme.bg,
      ratio: blogLinkBgRatio,
      level: getContrastLevel(blogLinkBgRatio),
      usage: 'Blog post content links, tag links on page background',
    });
  }

  // Footer contrast checks
  // Check primary contrast on footer background (brand name, default footer text)
  const primaryContrastFooterBgRatio = getContrastRatio(theme.primaryContrast, theme.footerBg);
  if (primaryContrastFooterBgRatio < 4.5) {
    issues.push({
      pair: 'Primary Contrast on Footer Background',
      foreground: theme.primaryContrast,
      background: theme.footerBg,
      ratio: primaryContrastFooterBgRatio,
      level: getContrastLevel(primaryContrastFooterBgRatio),
      usage: 'Footer brand name, default footer text',
    });
  }

  // Check footer text muted on footer background
  // Note: footerTextMuted is semi-transparent, so we need to blend it with footerBg first
  const blendedFooterTextMuted = blendColor(theme.footerTextMuted, theme.footerBg);
  const footerTextMutedRatio = getContrastRatio(blendedFooterTextMuted, theme.footerBg);
  if (footerTextMutedRatio < 4.5) {
    issues.push({
      pair: 'Footer Text Muted on Footer Background',
      foreground: blendedFooterTextMuted,
      background: theme.footerBg,
      ratio: footerTextMutedRatio,
      level: getContrastLevel(footerTextMutedRatio),
      usage: 'Footer brand text, footer links',
    });
  }

  // Check footer text subtle on footer background
  // Note: footerTextSubtle is semi-transparent, so we need to blend it with footerBg first
  const blendedFooterTextSubtle = blendColor(theme.footerTextSubtle, theme.footerBg);
  const footerTextSubtleRatio = getContrastRatio(blendedFooterTextSubtle, theme.footerBg);
  if (footerTextSubtleRatio < 4.5) {
    issues.push({
      pair: 'Footer Text Subtle on Footer Background',
      foreground: blendedFooterTextSubtle,
      background: theme.footerBg,
      ratio: footerTextSubtleRatio,
      level: getContrastLevel(footerTextSubtleRatio),
      usage: 'Footer copyright, legal links',
    });
  }

  // Check primary contrast on footer social background
  // Note: footerSocialBg is semi-transparent, so we need to blend it with footerBg first
  const blendedFooterSocialBg = blendColor(theme.footerSocialBg, theme.footerBg);
  const primaryContrastFooterSocialRatio = getContrastRatio(theme.primaryContrast, blendedFooterSocialBg);
  if (primaryContrastFooterSocialRatio < 4.5) {
    issues.push({
      pair: 'Primary Contrast on Footer Social Background',
      foreground: theme.primaryContrast,
      background: blendedFooterSocialBg,
      ratio: primaryContrastFooterSocialRatio,
      level: getContrastLevel(primaryContrastFooterSocialRatio),
      usage: 'Footer social media icons',
    });
  }

  // Check accent alt on footer background (link headings)
  const accentAltFooterBgRatio = getContrastRatio(theme.accentAlt, theme.footerBg);
  if (accentAltFooterBgRatio < 4.5) {
    issues.push({
      pair: 'Accent Alt on Footer Background',
      foreground: theme.accentAlt,
      background: theme.footerBg,
      ratio: accentAltFooterBgRatio,
      level: getContrastLevel(accentAltFooterBgRatio),
      usage: 'Footer link column headings',
    });
  }

  // Author Box gradient contrast checks
  // Note: Author box gradient might be semi-transparent, blend with white background first
  const authorBoxStartSolid = blendColor(theme.authorBoxStart, '#ffffff');
  const authorBoxEndSolid = blendColor(theme.authorBoxEnd, '#ffffff');
  
  // Check text dark on author box gradient (heading, author name)
  // Check against both gradient start and end, warn if either fails
  const textDarkAuthorBoxStartRatio = getContrastRatio(theme.textDark, authorBoxStartSolid);
  const textDarkAuthorBoxEndRatio = getContrastRatio(theme.textDark, authorBoxEndSolid);
  if (textDarkAuthorBoxStartRatio < 4.5 || textDarkAuthorBoxEndRatio < 4.5) {
    const minRatio = Math.min(textDarkAuthorBoxStartRatio, textDarkAuthorBoxEndRatio);
    issues.push({
      pair: 'Text Dark on Author Box Gradient',
      foreground: theme.textDark,
      background: `gradient(${theme.authorBoxStart} → ${theme.authorBoxEnd})`,
      ratio: minRatio,
      level: getContrastLevel(minRatio),
      usage: 'Author box heading, author name',
    });
  }

  // Check text on author box gradient (body text)
  const textAuthorBoxStartRatio = getContrastRatio(theme.text, authorBoxStartSolid);
  const textAuthorBoxEndRatio = getContrastRatio(theme.text, authorBoxEndSolid);
  if (textAuthorBoxStartRatio < 4.5 || textAuthorBoxEndRatio < 4.5) {
    const minRatio = Math.min(textAuthorBoxStartRatio, textAuthorBoxEndRatio);
    issues.push({
      pair: 'Text on Author Box Gradient',
      foreground: theme.text,
      background: `gradient(${theme.authorBoxStart} → ${theme.authorBoxEnd})`,
      ratio: minRatio,
      level: getContrastLevel(minRatio),
      usage: 'Author box body text',
    });
  }

  // Check blog link on author box gradient (author link)
  const blogLinkAuthorBoxStartRatio = getContrastRatio(theme.blogLink, authorBoxStartSolid);
  const blogLinkAuthorBoxEndRatio = getContrastRatio(theme.blogLink, authorBoxEndSolid);
  if (blogLinkAuthorBoxStartRatio < 4.5 || blogLinkAuthorBoxEndRatio < 4.5) {
    const minRatio = Math.min(blogLinkAuthorBoxStartRatio, blogLinkAuthorBoxEndRatio);
    issues.push({
      pair: 'Blog Link on Author Box Gradient',
      foreground: theme.blogLink,
      background: `gradient(${theme.authorBoxStart} → ${theme.authorBoxEnd})`,
      ratio: minRatio,
      level: getContrastLevel(minRatio),
      usage: 'Author box link',
    });
  }

  // Related Section gradient contrast checks
  // Check text on related section gradient
  const textRelatedSectionStartRatio = getContrastRatio(theme.text, theme.relatedSectionStart);
  const textRelatedSectionEndRatio = getContrastRatio(theme.text, theme.relatedSectionEnd);
  if (textRelatedSectionStartRatio < 4.5 || textRelatedSectionEndRatio < 4.5) {
    const minRatio = Math.min(textRelatedSectionStartRatio, textRelatedSectionEndRatio);
    issues.push({
      pair: 'Text on Related Section Gradient',
      foreground: theme.text,
      background: `gradient(${theme.relatedSectionStart} → ${theme.relatedSectionEnd})`,
      ratio: minRatio,
      level: getContrastLevel(minRatio),
      usage: 'Related content section text',
    });
  }

  // Blog card contrast checks (Latest Blogs section)
  // Check date text (text at 0.75 opacity) on card background
  // Apply opacity to text color, then blend with background
  const dateTextWithOpacity = Color(theme.text).alpha(0.75).rgb().string();
  const blendedDateText = blendColor(dateTextWithOpacity, theme.bg);
  const dateTextBgRatio = getContrastRatio(blendedDateText, theme.bg);
  if (dateTextBgRatio < 4.5) {
    issues.push({
      pair: 'Date Text (75% opacity) on Card Background',
      foreground: blendedDateText,
      background: theme.bg,
      ratio: dateTextBgRatio,
      level: getContrastLevel(dateTextBgRatio),
      usage: 'Blog card date in Latest Blogs section',
    });
  }

  // Check excerpt text (text at 0.8 opacity) on card background
  const excerptTextWithOpacity = Color(theme.text).alpha(0.8).rgb().string();
  const blendedExcerptText = blendColor(excerptTextWithOpacity, theme.bg);
  const excerptTextBgRatio = getContrastRatio(blendedExcerptText, theme.bg);
  if (excerptTextBgRatio < 4.5) {
    issues.push({
      pair: 'Excerpt Text (80% opacity) on Card Background',
      foreground: blendedExcerptText,
      background: theme.bg,
      ratio: excerptTextBgRatio,
      level: getContrastLevel(excerptTextBgRatio),
      usage: 'Blog card excerpt in Latest Blogs section',
    });
  }

  // Check card link (link color) on card background
  const cardLinkBgRatio = getContrastRatio(theme.link, theme.bg);
  if (cardLinkBgRatio < 4.5) {
    issues.push({
      pair: 'Card Link (Link) on Card Background',
      foreground: theme.link,
      background: theme.bg,
      ratio: cardLinkBgRatio,
      level: getContrastLevel(cardLinkBgRatio),
      usage: 'Blog card "Read More" link in Latest Blogs section',
    });
  }

  return issues;
}

