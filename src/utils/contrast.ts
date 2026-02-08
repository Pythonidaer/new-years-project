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
    // Fallback to original
    return foreground;
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
    // Return minimum contrast on error
    return 1;
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
  /** Where this color combination is used */
  usage: string;
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

  // Safe color helper that returns null on error
  const safeColor = (colorString: string): ReturnType<typeof Color> | null => {
    try {
      return Color(colorString);
    } catch (error) {
      console.warn(`Failed to parse color "${colorString}":`, error);
      return null;
    }
  };

  // Pre-create Color objects to avoid recreating them multiple times
  const textColor = safeColor(theme.text);
  const bgColor = safeColor(theme.bg);
  const primaryColor = safeColor(theme.primary);
  const primaryContrastColor = safeColor(theme.primaryContrast);
  const surfaceColor = safeColor(theme.surface);
  const surfaceDarkColor = safeColor(theme.surfaceDark);
  const textDarkColor = safeColor(theme.textDark);
  const linkColor = safeColor(theme.link);
  const footerBgColor = safeColor(theme.footerBg);
  const accentAltColor = safeColor(theme.accentAlt);
  const codeBgColor = safeColor(theme.codeBg);
  const codeTextColor = safeColor(theme.codeText);
  const blogLinkColor = safeColor(theme.blogLink);

  // Helper function that uses pre-created Color objects (handles nullable colors)
  const getContrastRatioOptimized = (
    color1: ReturnType<typeof Color> | null,
    color2: ReturnType<typeof Color> | null
  ): number => {
    if (!color1 || !color2) return 1;
    try {
      return color1.contrast(color2);
    } catch (error) {
      console.warn('Failed to calculate contrast ratio:', error);
      return 1;
    }
  };

  // Helper: Check simple contrast pair and add issue if needed
  const checkContrastPair = (
    pairName: string,
    foreground: ReturnType<typeof Color> | null,
    background: ReturnType<typeof Color> | null,
    foregroundStr: string,
    backgroundStr: string,
    usage: string
  ): void => {
    const ratio = getContrastRatioOptimized(foreground, background);
    if (ratio < 4.5) {
      issues.push({
        pair: pairName,
        foreground: foregroundStr,
        background: backgroundStr,
        ratio,
        level: getContrastLevel(ratio),
        usage,
      });
    }
  };

  // Helper: Check blended color contrast
  const checkBlendedContrast = (
    pairName: string,
    foregroundColor: string,
    backgroundColor: string,
    backgroundColorObj: ReturnType<typeof Color> | null,
    usage: string
  ): void => {
    const blended = blendColor(foregroundColor, backgroundColor);
    const blendedColorObj = safeColor(blended);
    const ratio = getContrastRatioOptimized(blendedColorObj, backgroundColorObj);
    if (ratio < 4.5) {
      issues.push({
        pair: pairName,
        foreground: blended,
        background: backgroundColor,
        ratio,
        level: getContrastLevel(ratio),
        usage,
      });
    }
  };

  // Helper: Check opacity-based contrast (text with opacity applied)
  const checkOpacityContrast = (
    pairName: string,
    baseColor: ReturnType<typeof Color> | null,
    opacity: number,
    backgroundColor: string,
    backgroundColorObj: ReturnType<typeof Color> | null,
    usage: string
  ): void => {
    if (!baseColor) return;
    try {
      const textWithOpacity = baseColor.alpha(opacity).rgb().string();
      const blended = blendColor(textWithOpacity, backgroundColor);
      const blendedColorObj = safeColor(blended);
      const ratio = getContrastRatioOptimized(blendedColorObj, backgroundColorObj);
      if (ratio < 4.5) {
        issues.push({
          pair: pairName,
          foreground: blended,
          background: backgroundColor,
          ratio,
          level: getContrastLevel(ratio),
          usage,
        });
      }
    } catch (error) {
      console.warn(`Failed to check opacity contrast for ${pairName}:`, error);
    }
  };

  // Helper: Check gradient contrast (text on gradient background)
  const checkGradientContrast = (
    pairName: string,
    foregroundColor: ReturnType<typeof Color> | null,
    foregroundStr: string,
    gradientStart: string,
    gradientEnd: string,
    usage: string
  ): void => {
    if (!foregroundColor) return;
    const startSolid = blendColor(gradientStart, '#ffffff');
    const endSolid = blendColor(gradientEnd, '#ffffff');
    const startColorObj = safeColor(startSolid);
    const endColorObj = safeColor(endSolid);

    const startRatio = getContrastRatioOptimized(foregroundColor, startColorObj);
    const endRatio = getContrastRatioOptimized(foregroundColor, endColorObj);
    if (startRatio < 4.5 || endRatio < 4.5) {
      const minRatio = Math.min(startRatio, endRatio);
      issues.push({
        pair: pairName,
        foreground: foregroundStr,
        background: `gradient(${gradientStart} → ${gradientEnd})`,
        ratio: minRatio,
        level: getContrastLevel(minRatio),
        usage,
      });
    }
  };

  // Simple contrast checks
  checkContrastPair('Text on Background', textColor, bgColor, theme.text, theme.bg, 'Body text, headings (Blogs page, Categories page), main content areas');
  checkContrastPair('Primary Contrast on Primary', primaryContrastColor, primaryColor, theme.primaryContrast, theme.primary, 'Primary buttons, CTAs');
  checkContrastPair('Text Dark on Background', textDarkColor, bgColor, theme.textDark, theme.bg, 'Header (scrolled state), Blog heading on white background');
  checkContrastPair('Primary Contrast on Surface Dark', primaryContrastColor, surfaceDarkColor, theme.primaryContrast, theme.surfaceDark, 'Blog post hero section, Header (dark variant)');
  checkContrastPair('Text on Surface', textColor, surfaceColor, theme.text, theme.surface, 'Cards, elevated surfaces');
  checkContrastPair('Code Text on Code Background', codeTextColor, codeBgColor, theme.codeText, theme.codeBg, 'Code blocks, inline code');
  checkContrastPair('Link on Background', linkColor, bgColor, theme.link, theme.bg, 'Hyperlinks on page background');
  checkContrastPair('Blog Link on Background', blogLinkColor, bgColor, theme.blogLink, theme.bg, 'Blog post content links, tag links on page background');
  checkContrastPair('Primary Contrast on Footer Background', primaryContrastColor, footerBgColor, theme.primaryContrast, theme.footerBg, 'Footer brand name, default footer text');
  checkContrastPair('Accent Alt on Footer Background', accentAltColor, footerBgColor, theme.accentAlt, theme.footerBg, 'Footer link column headings');
  checkContrastPair('Card Link (Link) on Card Background', linkColor, bgColor, theme.link, theme.bg, 'Blog card "Read More" link in Latest Blogs section');

  // Opacity-based contrast checks
  checkOpacityContrast('Author Role Text (75% opacity) on Surface Background', textColor, 0.75, theme.surface, surfaceColor, 'Customer spotlight author role on homepage');
  checkOpacityContrast('Date Text (75% opacity) on Card Background', textColor, 0.75, theme.bg, bgColor, 'Blog card date in Latest Blogs section');
  checkOpacityContrast('Excerpt Text (80% opacity) on Card Background', textColor, 0.8, theme.bg, bgColor, 'Blog card excerpt in Latest Blogs section');

  // Blended color contrast checks
  checkBlendedContrast('Footer Text Muted on Footer Background', theme.footerTextMuted, theme.footerBg, footerBgColor, 'Footer brand text, footer links');
  checkBlendedContrast('Footer Text Subtle on Footer Background', theme.footerTextSubtle, theme.footerBg, footerBgColor, 'Footer copyright, legal links');
  const blendedFooterSocialBg = blendColor(theme.footerSocialBg, theme.footerBg);
  checkContrastPair('Primary Contrast on Footer Social Background', primaryContrastColor, safeColor(blendedFooterSocialBg), theme.primaryContrast, blendedFooterSocialBg, 'Footer social media icons');
  checkBlendedContrast('Category Link on Blog Card Background', theme.footerTextMuted, theme.surfaceDark, surfaceDarkColor, 'Blog grid card category links on dark card background');

  // Gradient contrast checks
  checkGradientContrast('Text Dark on Author Box Gradient', textDarkColor, theme.textDark, theme.authorBoxStart, theme.authorBoxEnd, 'Author box heading, author name');
  checkGradientContrast('Text on Author Box Gradient', textColor, theme.text, theme.authorBoxStart, theme.authorBoxEnd, 'Author box body text');
  checkGradientContrast('Blog Link on Author Box Gradient', blogLinkColor, theme.blogLink, theme.authorBoxStart, theme.authorBoxEnd, 'Author box link');
  checkGradientContrast('Text on Related Section Gradient', textColor, theme.text, theme.relatedSectionStart, theme.relatedSectionEnd, 'Related content section text');

  return issues;
}

