import { useState, useRef, useEffect, useMemo } from 'react';
import { useTheme } from '@/context/useTheme';
import { checkContrastIssues } from '@/utils/contrast';
import { RotateCcw, Save, X, Palette, Bookmark, Trash2, ChevronDown, ChevronUp, Music, Pin } from 'lucide-react';
import Color from 'color';
import styles from './ThemePicker.module.css';

type ColorToken = {
  key: keyof ReturnType<typeof useTheme>['theme'];
  label: string;
  cssVar: string;
  category: 'core' | 'primary' | 'accent' | 'gradient' | 'footer' | 'shadows';
  usage?: string; // Where this color is actually used
  isGradient?: boolean;
  gradientPartner?: string; // For gradient pairs (start/end)
};

const colorTokens: ColorToken[] = [
  // Core colors - foundational colors used throughout the site
  { key: 'bg', label: 'Background', cssVar: '--color-bg', category: 'core', usage: 'Page background, section backgrounds' },
  { key: 'surface', label: 'Surface', cssVar: '--color-surface', category: 'core', usage: 'Elevated card backgrounds (feature cards, platform cards)' },
  { key: 'surfaceDark', label: 'Dark Background', cssVar: '--color-surface-dark', category: 'core', usage: 'Hero sections, blog post headers (dark variant), blog card backgrounds' },
  { key: 'marqueeBg', label: 'Marquee Background', cssVar: '--color-marquee-bg', category: 'core', usage: 'Hero marquee section background' },
  { key: 'text', label: 'Text', cssVar: '--color-text', category: 'core', usage: 'Body text, headings, general content' },
  { key: 'textDark', label: 'Text Dark', cssVar: '--color-text-dark', category: 'core', usage: 'Dark text on light backgrounds, header (scrolled state)' },
  { key: 'muted', label: 'Muted', cssVar: '--color-muted', category: 'core', usage: 'Secondary text, placeholders, subtle content' },
  { key: 'border', label: 'Border', cssVar: '--color-border', category: 'core', usage: 'Borders, dividers, input borders' },
  { key: 'codeBg', label: 'Code Background', cssVar: '--color-code-bg', category: 'core', usage: 'Code block backgrounds, inline code backgrounds' },
  { key: 'codeText', label: 'Code Text', cssVar: '--color-code-text', category: 'core', usage: 'Code block text, inline code text' },
  { key: 'heroRadial', label: 'Hero Radial Overlay', cssVar: '--color-hero-radial', category: 'core' },
  
  // Primary colors - brand/action colors for buttons, links, CTAs
  { key: 'primary', label: 'Primary', cssVar: '--color-primary', category: 'primary', usage: 'Buttons, social icon hover states' },
  { key: 'primaryHover', label: 'Primary Hover', cssVar: '--color-primary-hover', category: 'primary', usage: 'Button hover states' },
  { key: 'primaryContrast', label: 'Primary Contrast', cssVar: '--color-primary-contrast', category: 'primary', usage: 'Text on primary buttons, white text on dark backgrounds' },
  { key: 'blogLink', label: 'Blog Link', cssVar: '--color-blog-link', category: 'primary', usage: 'Blog post tags, author links, content links' },
  // { key: 'link', label: 'Link', cssVar: '--color-link', category: 'primary', usage: 'Not currently used (reserved for future link styling)' },
  { key: 'focus', label: 'Focus', cssVar: '--color-focus', category: 'primary', usage: 'Focus rings, keyboard navigation indicators' },
  
  // Accent colors
  { key: 'accent', label: 'Accent', cssVar: '--color-accent', category: 'accent', usage: 'Hero title accents, highlights' },
  { key: 'accentAlt', label: 'Accent Alt', cssVar: '--color-accent-alt', category: 'accent', usage: 'Footer headings, navigation underlines' },
  
  // Gradient colors - all gradients grouped together
  { key: 'heroStart', label: 'Homepage Hero Gradient Start', cssVar: '--color-hero-start', category: 'gradient', isGradient: true, gradientPartner: 'heroEnd' },
  { key: 'heroEnd', label: 'Homepage Hero Gradient End', cssVar: '--color-hero-end', category: 'gradient', isGradient: true, gradientPartner: 'heroStart' },
  { key: 'campaignStart', label: 'Campaign Gradient Start', cssVar: '--color-campaign-start', category: 'gradient', isGradient: true, gradientPartner: 'campaignEnd' },
  { key: 'campaignEnd', label: 'Campaign Gradient End', cssVar: '--color-campaign-end', category: 'gradient', isGradient: true, gradientPartner: 'campaignStart' },
  { key: 'authorBoxStart', label: 'Author Box Gradient Start', cssVar: '--color-author-box-start', category: 'gradient', isGradient: true, gradientPartner: 'authorBoxEnd' },
  { key: 'authorBoxEnd', label: 'Author Box Gradient End', cssVar: '--color-author-box-end', category: 'gradient', isGradient: true, gradientPartner: 'authorBoxStart' },
  { key: 'relatedSectionStart', label: 'Related Section Gradient Start', cssVar: '--color-related-section-start', category: 'gradient', isGradient: true, gradientPartner: 'relatedSectionEnd' },
  { key: 'relatedSectionEnd', label: 'Related Section Gradient End', cssVar: '--color-related-section-end', category: 'gradient', isGradient: true, gradientPartner: 'relatedSectionStart' },
  
  // Footer colors
  { key: 'footerBg', label: 'Footer Background', cssVar: '--color-footer-bg', category: 'footer', usage: 'Footer section background' },
  { key: 'footerTextMuted', label: 'Muted Text', cssVar: '--color-footer-text-muted', category: 'footer', usage: 'Footer text/links, blog card categories, placeholder text' },
  { key: 'footerTextSubtle', label: 'Footer Text Subtle', cssVar: '--color-footer-text-subtle', category: 'footer', usage: 'Footer copyright, legal links' },
  { key: 'footerSocialBg', label: 'Footer Social Background', cssVar: '--color-footer-social-bg', category: 'footer', usage: 'Social media icon backgrounds' },
  { key: 'footerBorder', label: 'Footer Border', cssVar: '--color-footer-border', category: 'footer', usage: 'Footer section borders' },
  
  // Shadows
  { key: 'shadow', label: 'Shadow', cssVar: '--color-shadow', category: 'shadows', usage: 'Card shadows, elevated elements' },
  { key: 'shadowSubtle', label: 'Shadow Subtle', cssVar: '--color-shadow-subtle', category: 'shadows', usage: 'Subtle shadows, hover effects' },
];

const categoryLabels: Record<ColorToken['category'], string> = {
  core: 'Core Colors (page backgrounds, body text)',
  primary: 'Primary Colors (buttons, blog links, social icon hover)',
  accent: 'Accent Colors',
  gradient: 'Gradients',
  footer: 'Footer',
  shadows: 'Shadows',
};

// Helper component for rendering a single color item
type ColorItemProps = {
  token: ColorToken;
  currentValue: string;
  hasChange: boolean;
  onColorChange: (key: keyof ReturnType<typeof useTheme>['theme'], value: string) => void;
  onCancel: (key: keyof ReturnType<typeof useTheme>['theme']) => void;
  colorToHex: (color: string) => string;
  styles: typeof styles;
};

function ColorItem({ token, currentValue, hasChange, onColorChange, onCancel, colorToHex, styles }: ColorItemProps) {
  return (
    <div className={styles.colorItem}>
      <div
        className={styles.colorSwatch}
        style={{ backgroundColor: currentValue, borderRadius: '8px' }}
      />
      <div className={styles.colorInfo}>
        <label htmlFor={`color-input-${token.key}`} className={styles.colorLabel}>{token.label}</label>
        {token.usage && (
          <div className={styles.colorUsage}>{token.usage}</div>
        )}
        <div className={styles.colorValue}>{currentValue}</div>
      </div>
      <input
        id={`color-input-${token.key}`}
        type="color"
        value={colorToHex(currentValue)}
        onChange={(e) => onColorChange(token.key, e.target.value)}
        className={styles.colorInput}
      />
      {hasChange && (
        <button
          onClick={() => onCancel(token.key)}
          className={styles.cancelBtn}
          aria-label={`Cancel ${token.label} change`}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

// Helper component for rendering a gradient group
type GradientGroupProps = {
  gradientTokens: ColorToken[];
  gradientPreview: string;
  localChanges: Partial<ReturnType<typeof useTheme>['theme']>;
  theme: ReturnType<typeof useTheme>['theme'];
  onColorChange: (key: keyof ReturnType<typeof useTheme>['theme'], value: string) => void;
  onCancel: (key: keyof ReturnType<typeof useTheme>['theme']) => void;
  colorToHex: (color: string) => string;
  styles: typeof styles;
};

function GradientGroup({ gradientTokens, gradientPreview, localChanges, theme, onColorChange, onCancel, colorToHex, styles }: GradientGroupProps) {
  if (gradientTokens.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.gradientPreview} style={{ background: gradientPreview }} />
      <div className={styles.gradientControls}>
        {gradientTokens.map((token) => {
          const currentValue = localChanges[token.key] ?? theme[token.key];
          const hasChange = token.key in localChanges;
          return (
            <ColorItem
              key={token.key}
              token={token}
              currentValue={currentValue}
              hasChange={hasChange}
              onColorChange={onColorChange}
              onCancel={onCancel}
              colorToHex={colorToHex}
              styles={styles}
            />
          );
        })}
      </div>
    </>
  );
}

// Helper component for rendering color categories
type ColorCategoriesProps = {
  colorTokens: ColorToken[];
  categoryLabels: Record<ColorToken['category'], string>;
  localChanges: Partial<ReturnType<typeof useTheme>['theme']>;
  theme: ReturnType<typeof useTheme>['theme'];
  onColorChange: (key: keyof ReturnType<typeof useTheme>['theme'], value: string) => void;
  onCancel: (key: keyof ReturnType<typeof useTheme>['theme']) => void;
  colorToHex: (color: string) => string;
  getGradientPreview: () => string;
  getCampaignGradientPreview: () => string;
  getAuthorBoxGradientPreview: () => string;
  getRelatedSectionGradientPreview: () => string;
  styles: typeof styles;
};

function ColorCategories({
  colorTokens,
  categoryLabels,
  localChanges,
  theme,
  onColorChange,
  onCancel,
  colorToHex,
  getGradientPreview,
  getCampaignGradientPreview,
  getAuthorBoxGradientPreview,
  getRelatedSectionGradientPreview,
  styles,
}: ColorCategoriesProps) {
  return (
    <div className={styles.colorsScrollArea}>
      {(['core', 'primary', 'accent', 'gradient', 'footer', 'shadows'] as const).map((category) => {
        const categoryTokens = colorTokens.filter((token) => token.category === category);
        if (categoryTokens.length === 0) return null;

        const gradientTokens = categoryTokens.filter((token) => token.isGradient);

        if (category === 'gradient' && gradientTokens.length > 0) {
          const heroGradient = gradientTokens.filter(t => t.gradientPartner === 'heroEnd' || t.key === 'heroEnd');
          const campaignGradient = gradientTokens.filter(t => t.gradientPartner === 'campaignEnd' || t.key === 'campaignEnd');
          const authorBoxGradient = gradientTokens.filter(t => t.gradientPartner === 'authorBoxEnd' || t.key === 'authorBoxEnd');
          const relatedSectionGradient = gradientTokens.filter(t => t.gradientPartner === 'relatedSectionEnd' || t.key === 'relatedSectionEnd');

          return (
            <div key={category} className={styles.colorCategory}>
              <h4 className={styles.sectionTitle}>{categoryLabels[category]}</h4>
              <GradientGroup
                gradientTokens={heroGradient}
                gradientPreview={getGradientPreview()}
                localChanges={localChanges}
                theme={theme}
                onColorChange={onColorChange}
                onCancel={onCancel}
                colorToHex={colorToHex}
                styles={styles}
              />
              <GradientGroup
                gradientTokens={campaignGradient}
                gradientPreview={getCampaignGradientPreview()}
                localChanges={localChanges}
                theme={theme}
                onColorChange={onColorChange}
                onCancel={onCancel}
                colorToHex={colorToHex}
                styles={styles}
              />
              <GradientGroup
                gradientTokens={authorBoxGradient}
                gradientPreview={getAuthorBoxGradientPreview()}
                localChanges={localChanges}
                theme={theme}
                onColorChange={onColorChange}
                onCancel={onCancel}
                colorToHex={colorToHex}
                styles={styles}
              />
              <GradientGroup
                gradientTokens={relatedSectionGradient}
                gradientPreview={getRelatedSectionGradientPreview()}
                localChanges={localChanges}
                theme={theme}
                onColorChange={onColorChange}
                onCancel={onCancel}
                colorToHex={colorToHex}
                styles={styles}
              />
            </div>
          );
        }

        return (
          <div key={category} className={styles.colorCategory}>
            <h4 className={styles.sectionTitle}>{categoryLabels[category]}</h4>
            <div className={styles.colors}>
              {categoryTokens.map((token) => {
                const currentValue = localChanges[token.key] ?? theme[token.key];
                const hasChange = token.key in localChanges;
                return (
                  <ColorItem
                    key={token.key}
                    token={token}
                    currentValue={currentValue}
                    hasChange={hasChange}
                    onColorChange={onColorChange}
                    onCancel={onCancel}
                    colorToHex={colorToHex}
                    styles={styles}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ThemePicker() {
  const { theme, updateTheme, resetTheme, presets, savePreset, loadPreset, deletePreset, currentPresetId } = useTheme();
  const [localChanges, setLocalChanges] = useState<Partial<typeof theme>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [isPresetsExpanded, setIsPresetsExpanded] = useState(false);
  const [isPresetsHeaderCollapsed, setIsPresetsHeaderCollapsed] = useState(false);
  const [isTriggerHidden, setIsTriggerHidden] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Check contrast issues whenever theme or local changes update (useMemo to avoid effect warning)
        const contrastIssues = useMemo(() => {
          const currentTheme = { ...theme, ...localChanges };
          return checkContrastIssues({
            bg: currentTheme.bg,
            text: currentTheme.text,
            primary: currentTheme.primary,
            primaryContrast: currentTheme.primaryContrast,
            surface: currentTheme.surface,
            surfaceDark: currentTheme.surfaceDark,
            textDark: currentTheme.textDark,
            link: currentTheme.link,
            footerBg: currentTheme.footerBg,
            footerTextMuted: currentTheme.footerTextMuted,
            footerTextSubtle: currentTheme.footerTextSubtle,
            footerSocialBg: currentTheme.footerSocialBg,
            accentAlt: currentTheme.accentAlt,
            codeBg: currentTheme.codeBg,
            codeText: currentTheme.codeText,
            blogLink: currentTheme.blogLink,
            authorBoxStart: currentTheme.authorBoxStart,
            authorBoxEnd: currentTheme.authorBoxEnd,
            relatedSectionStart: currentTheme.relatedSectionStart,
            relatedSectionEnd: currentTheme.relatedSectionEnd,
          });
        }, [theme, localChanges]);

  // Handle individual color change (not saved yet)
  const handleColorChange = (key: keyof typeof theme, value: string) => {
    setLocalChanges((prev) => ({ ...prev, [key]: value }));
    // Apply temporarily for preview
    const root = document.getElementById('root');
    if (root) {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    }
  };

  // Cancel individual change
  const handleCancel = (key: keyof typeof theme) => {
    setLocalChanges((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    // Revert to saved theme value
    const root = document.getElementById('root');
    if (root) {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, theme[key]);
    }
  };

  // Save all changes
  const handleSave = () => {
    if (Object.keys(localChanges).length > 0) {
      updateTheme(localChanges);
      setLocalChanges({});
    }
    setIsOpen(false);
  };

  // Reset to defaults
  const handleReset = () => {
    resetTheme();
    setLocalChanges({});
    setIsOpen(false);
  };

  // Load preset
  const handleLoadPreset = (presetId: string) => {
    loadPreset(presetId);
    setLocalChanges({});
  };

  // Save current theme as preset
  const handleSavePreset = () => {
    if (presetName.trim()) {
      // Create theme with current state + local changes
      const themeToSave = { ...theme, ...localChanges };
      // Save the preset
      savePreset(presetName.trim(), themeToSave);
      setPresetName('');
      setShowSavePreset(false);
      // Note: We don't clear localChanges here - user might want to save then continue editing
    }
  };

  // Delete preset
  const handleDeletePreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this preset?')) {
      deletePreset(presetId);
    }
  };

  // Close on backdrop click (but not when clicking the trigger button or drawer)
  useEffect(() => {
    const handleBackdropClick = (event: MouseEvent) => {
      const target = event.target as Node;
      // Close if clicking the backdrop (but not the drawer or trigger)
      if (
        backdropRef.current === target &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleBackdropClick);
      return () => document.removeEventListener('mousedown', handleBackdropClick);
    }
  }, [isOpen]);

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Control trigger icon visibility with delay when drawer closes
  useEffect(() => {
    if (isOpen) {
      // Hide icon immediately when drawer opens (async to avoid linter warning)
      setTimeout(() => setIsTriggerHidden(true), 0);
    } else {
      // Show icon after drawer slide-out animation completes (200ms)
      const timer = setTimeout(() => {
        setIsTriggerHidden(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Control presets header margin with delay when closing
  useEffect(() => {
    if (isPresetsExpanded) {
      // Remove collapsed state immediately when opening (async to avoid linter warning)
      setTimeout(() => setIsPresetsHeaderCollapsed(false), 0);
    } else {
      // Add collapsed state after transition completes (300ms)
      const timer = setTimeout(() => {
        setIsPresetsHeaderCollapsed(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isPresetsExpanded]);

  // Helper to convert color to hex for input
  const colorToHex = (color: string): string => {
    try {
      // Handle rgba - extract rgb values (color input doesn't support alpha)
      if (color.startsWith('rgba')) {
        const matches = color.match(/\d+/g);
        if (matches && matches.length >= 3) {
          const r = parseInt(matches[0]);
          const g = parseInt(matches[1]);
          const b = parseInt(matches[2]);
          return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
        }
      }
      // Use color library to handle other formats (rgb, hex, etc.)
      const parsed = Color(color);
      return parsed.hex();
    } catch {
      // Fallback: if it's already hex, return as-is
      if (color.startsWith('#')) {
        return color;
      }
      // Default fallback
      return '#000000';
    }
  };

  // Get gradient preview for hero colors
  const getGradientPreview = () => {
    const start = localChanges.heroStart ?? theme.heroStart;
    const end = localChanges.heroEnd ?? theme.heroEnd;
    return `linear-gradient(180deg, ${start}, ${end})`;
  };

  // Get gradient preview for campaign colors
  const getCampaignGradientPreview = () => {
    const start = localChanges.campaignStart ?? theme.campaignStart;
    const end = localChanges.campaignEnd ?? theme.campaignEnd;
    return `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
  };

  // Get gradient preview for author box
  const getAuthorBoxGradientPreview = () => {
    const start = localChanges.authorBoxStart ?? theme.authorBoxStart;
    const end = localChanges.authorBoxEnd ?? theme.authorBoxEnd;
    return `linear-gradient(${start}, ${end})`;
  };

  // Get gradient preview for related section
  const getRelatedSectionGradientPreview = () => {
    const start = localChanges.relatedSectionStart ?? theme.relatedSectionStart;
    const end = localChanges.relatedSectionEnd ?? theme.relatedSectionEnd;
    return `linear-gradient(${start}, ${end} 115%)`;
  };

  // Check if theme has audio easter egg
  const hasAudioEasterEgg = (presetId: string): boolean => {
    return presetId === 'noname' || presetId === 'samson' || presetId === 'vapor-wave' || presetId === 'king' || presetId === 'planet';
  };

  // Handle keyboard navigation for presets header
  const handlePresetsHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsPresetsExpanded(!isPresetsExpanded);
    }
  };

  // Handle keyboard navigation for save preset input
  const handleSavePresetKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSavePreset();
    } else if (e.key === 'Escape') {
      setShowSavePreset(false);
      setPresetName('');
    }
  };

  // Check if preset is built-in (not deletable)
  const isBuiltInPreset = (presetId: string): boolean => {
    const builtInIds = [
      'default',
      'pink',
      'dayglow',
      'king',
    ];
    
    const builtInPrefixes = [
      'cedar',
      'sage',
      'crimson',
      'vapor',
      'gothic',
      'pastel',
      'horror',
      'pride',
      'yuko',
      'hokusai',
      'noname',
      'sadikovic',
      'afb',
      'tuf',
      'royboy',
      'dalmatian',
      'querida',
      'ris',
      'gulu',
      'maxine',
      'sunrise',
      'noir',
      'hatsune',
      'trippie',
      'scotland',
      'pbr',
      'reeses',
      'fallout',
      'berge',
      'samson',
      'companion',
      'gusto',
      'facecrusher',
      'planet',
      'visser',
      'yolandi',
    ];

    if (builtInIds.includes(presetId)) {
      return true;
    }

    return builtInPrefixes.some(prefix => presetId.startsWith(prefix));
  };

  return (
    <>
      <button
        ref={triggerRef}
        className={`${styles.trigger} ${isTriggerHidden ? styles.triggerHidden : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open theme picker"
        title="Theme Picker"
      >
        <Palette size={20} />
      </button>
      <>
        <div 
          ref={backdropRef} 
          className={`${styles.backdrop} ${!isOpen ? styles.backdropHidden : ''}`}
        />
        <div 
          ref={drawerRef} 
          className={`${styles.drawer} ${!isOpen ? styles.drawerHidden : ''}`}
        >
          <div className={styles.header}>
            <h3 className={styles.title}>Theme Colors</h3>
            <div className={styles.actions}>
              <button
                onClick={handleReset}
                className={styles.resetBtn}
                aria-label="Reset to defaults"
                title="Reset"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={handleSave}
                className={styles.saveBtn}
                aria-label="Save changes"
                title="Save"
                disabled={Object.keys(localChanges).length === 0}
              >
                <Save size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={styles.closeBtn}
                aria-label="Close"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className={styles.contentArea}>
            {contrastIssues.length > 0 && (
              <div className={styles.warnings}>
                <h4 className={styles.warningTitle}>Contrast Warnings</h4>
                {contrastIssues.map((issue, idx) => (
                  <div key={idx} className={styles.warning}>
                    <div className={styles.warningHeader}>
                      <span className={styles.warningPair}>{issue.pair}</span>
                      <span className={styles.warningLevel} data-level={issue.level}>
                        {issue.level}
                      </span>
                    </div>
                    <div className={styles.warningDetails}>
                      <div className={styles.warningUsage}>
                        <strong>Used in:</strong> {issue.usage}
                      </div>
                      <div className={styles.warningExplanation}>
                        WCAG requires at least 4.5:1 for normal text (AA) or 7:1 for AAA. 
                        This combination fails accessibility standards.
                      </div>
                      <div className={styles.warningRatio}>
                        <strong>Contrast Ratio:</strong> {issue.ratio.toFixed(2)}:1 (needs ≥4.5:1)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Presets Section */}
            <div className={styles.presetsSection}>
              <div 
                className={`${styles.presetsHeader} ${isPresetsHeaderCollapsed ? styles.presetsHeaderCollapsed : ''}`}
                onClick={() => setIsPresetsExpanded(!isPresetsExpanded)}
                role="button"
                tabIndex={0}
                onKeyDown={handlePresetsHeaderKeyDown}
                aria-label={isPresetsExpanded ? 'Collapse presets' : 'Expand presets'}
                aria-expanded={isPresetsExpanded}
              >
                <h4 className={styles.presetsTitle}>Choose a theme</h4>
                <button
                  className={styles.presetsToggle}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent double-toggle
                    setIsPresetsExpanded(!isPresetsExpanded);
                  }}
                  aria-label={isPresetsExpanded ? 'Collapse presets' : 'Expand presets'}
                  aria-expanded={isPresetsExpanded}
                >
                  {isPresetsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              <div className={`${styles.presetsGrid} ${!isPresetsExpanded ? styles.presetsGridCollapsed : ''}`}>
                {presets.map((preset) => {
                  const isBuiltIn = isBuiltInPreset(preset.id);
                  const showEasterEgg = hasAudioEasterEgg(preset.id);
                  const isSelected = preset.id === currentPresetId;
                  return (
                    <div key={preset.id} className={styles.presetButtonWrapper}>
                      <button
                        className={styles.presetButton}
                        onClick={() => handleLoadPreset(preset.id)}
                      >
                        <span className={styles.presetName}>{preset.name}</span>
                        <div className={styles.presetIconContainer}>
                          {showEasterEgg && <Music size={16} className={styles.presetIcon} />}
                          {isSelected && <Pin size={16} className={styles.presetIcon} fill="currentColor" />}
                          {!isBuiltIn && (
                            <button
                              className={styles.deletePresetBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePreset(preset.id, e);
                              }}
                              aria-label={`Delete ${preset.name} preset`}
                              title="Delete preset"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
                <div className={styles.savePresetContainer}>
                  <button
                    className={styles.savePresetButton}
                    onClick={() => setShowSavePreset(true)}
                    style={{ display: showSavePreset ? 'none' : 'flex' }}
                  >
                    <Bookmark size={14} />
                    <span>Save as Preset</span>
                  </button>
                  {showSavePreset && (
                    <div className={styles.savePresetInputRow}>
                      <input
                        type="text"
                        placeholder="Preset name..."
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        onKeyDown={handleSavePresetKeyDown}
                        className={styles.presetNameInput}
                        autoFocus
                      />
                      <button
                        onClick={handleSavePreset}
                        className={styles.savePresetConfirm}
                        disabled={!presetName.trim()}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setShowSavePreset(false);
                          setPresetName('');
                        }}
                        className={styles.savePresetCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ColorCategories
              colorTokens={colorTokens}
              categoryLabels={categoryLabels}
              localChanges={localChanges}
              theme={theme}
              onColorChange={handleColorChange}
              onCancel={handleCancel}
              colorToHex={colorToHex}
              getGradientPreview={getGradientPreview}
              getCampaignGradientPreview={getCampaignGradientPreview}
              getAuthorBoxGradientPreview={getAuthorBoxGradientPreview}
              getRelatedSectionGradientPreview={getRelatedSectionGradientPreview}
              styles={styles}
            />
          </div>
        </div>
      </>
    </>
  );
}

