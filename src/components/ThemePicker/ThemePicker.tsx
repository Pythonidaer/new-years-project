import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '@/context/useTheme';
import type { Theme } from '@/context/themes/types';
import { checkContrastIssues } from '@/utils/contrast';
import { clearContrastReviewMark, colorControlElementId, highlightedKeysForOpenIssue, jumpTargetsForIssue, reviewContrastOnPage, scrollToColorControl } from '@/utils/contrastJump';
import { applyThemePreview } from '@/utils/imageTheme';
import { ImageThemeUpload } from '@/components/ThemePicker/ImageThemeUpload';
import { PresetNameField } from '@/components/ThemePicker/PresetNameField';
import { ColorCategoryGroup, ColorCategorySection } from '@/components/ThemePicker/ColorCategorySection';
import { ContrastWarnings } from '@/components/ThemePicker/ContrastWarnings';
import { RotateCcw, Save, X, Palette, Bookmark, Trash2, ChevronDown, ChevronUp, Music, Pin } from 'lucide-react';
import Color from 'color';
import styles from './ThemePicker.module.css';

type ColorToken = {
  key: keyof ReturnType<typeof useTheme>['theme'];
  label: string;
  cssVar: string;
  category: 'core' | 'primary' | 'accent' | 'gradient' | 'footer' | 'shadows';
  /** Where this color is actually used */
  usage?: string;
  isGradient?: boolean;
  /** For gradient pairs (start/end) */
  gradientPartner?: string;
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
  { key: 'heroStart', label: 'Hero Gradient Start', cssVar: '--color-hero-start', category: 'gradient', usage: 'Homepage hero background', isGradient: true, gradientPartner: 'heroEnd' },
  { key: 'heroEnd', label: 'Hero Gradient End', cssVar: '--color-hero-end', category: 'gradient', usage: 'Homepage hero background', isGradient: true, gradientPartner: 'heroStart' },
  { key: 'campaignStart', label: 'Campaign Gradient Start', cssVar: '--color-campaign-start', category: 'gradient', usage: 'Campaign section background', isGradient: true, gradientPartner: 'campaignEnd' },
  { key: 'campaignEnd', label: 'Campaign Gradient End', cssVar: '--color-campaign-end', category: 'gradient', usage: 'Campaign section background', isGradient: true, gradientPartner: 'campaignStart' },
  { key: 'authorBoxStart', label: 'Author Gradient Start', cssVar: '--color-author-box-start', category: 'gradient', usage: 'Author box background', isGradient: true, gradientPartner: 'authorBoxEnd' },
  { key: 'authorBoxEnd', label: 'Author Gradient End', cssVar: '--color-author-box-end', category: 'gradient', usage: 'Author box background', isGradient: true, gradientPartner: 'authorBoxStart' },
  { key: 'relatedSectionStart', label: 'Related Gradient Start', cssVar: '--color-related-section-start', category: 'gradient', usage: 'Related posts background', isGradient: true, gradientPartner: 'relatedSectionEnd' },
  { key: 'relatedSectionEnd', label: 'Related Gradient End', cssVar: '--color-related-section-end', category: 'gradient', usage: 'Related posts background', isGradient: true, gradientPartner: 'relatedSectionStart' },
  
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
  core: 'Core',
  primary: 'Primary',
  accent: 'Accent',
  gradient: 'Gradients',
  footer: 'Footer',
  shadows: 'Shadows',
};

const colorCategories = ['core', 'primary', 'accent', 'gradient', 'footer', 'shadows'] as const;

const colorControlsLabel = 'Customize colors';

const colorTokenKeys = new Set<string>(colorTokens.map((token) => token.key));

function areColorControlsVisible(hideUntilContrastIssue: boolean, hasContrastIssue: boolean): boolean {
  if (!hideUntilContrastIssue) {
    return true;
  }
  return hasContrastIssue;
}

type ColorItemProps = {
  token: ColorToken;
  currentValue: string;
  hasChange: boolean;
  onColorChange: (_key: keyof ReturnType<typeof useTheme>['theme'], _value: string) => void;
  onCancel: (_key: keyof ReturnType<typeof useTheme>['theme']) => void;
  colorToHex: (_color: string) => string;
  highlightedKeys: ReadonlySet<string>;
  styles: typeof styles;
};

function colorItemClassName(isJumpTarget: boolean): string {
  if (isJumpTarget) {
    return `${styles.colorItem} ${styles.colorItemJumpTarget}`;
  }
  return styles.colorItem;
}

function ColorItem({
  token,
  currentValue,
  hasChange,
  onColorChange,
  onCancel,
  colorToHex,
  highlightedKeys,
  styles,
}: ColorItemProps) {
  const isJumpTarget = highlightedKeys.has(token.key);

  return (
    <div id={colorControlElementId(token.key)} className={colorItemClassName(isJumpTarget)}>
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

type GradientGroupProps = {
  gradientTokens: ColorToken[];
  gradientPreview: string;
  localChanges: Partial<ReturnType<typeof useTheme>['theme']>;
  theme: ReturnType<typeof useTheme>['theme'];
  onColorChange: (_key: keyof ReturnType<typeof useTheme>['theme'], _value: string) => void;
  onCancel: (_key: keyof ReturnType<typeof useTheme>['theme']) => void;
  colorToHex: (_color: string) => string;
  highlightedKeys: ReadonlySet<string>;
  styles: typeof styles;
};

function GradientGroup({
  gradientTokens,
  gradientPreview,
  localChanges,
  theme,
  onColorChange,
  onCancel,
  colorToHex,
  highlightedKeys,
  styles,
}: GradientGroupProps) {
  if (gradientTokens.length === 0) {
    return null;
  }

  return (
    <div className={styles.gradientGroup}>
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
              highlightedKeys={highlightedKeys}
              styles={styles}
            />
          );
        })}
      </div>
    </div>
  );
}

// Helper functions for preset checks
function hasAudioEasterEgg(presetId: string): boolean {
  return presetId === 'noname' || presetId === 'samson' || presetId === 'vapor-wave' || presetId === 'king' || presetId === 'planet';
}

function isBuiltInPreset(presetId: string): boolean {
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
    'skolavor',
    'iceland',
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
}

type PresetSectionProps = {
  presets: Array<{ id: string; name: string }>;
  currentPresetId: string | null;
  isPresetsExpanded: boolean;
  isPresetsHeaderCollapsed: boolean;
  showSavePreset: boolean;
  presetName: string;
  onLoadPreset: (_presetId: string) => void;
  onDeletePreset: (_presetId: string, _e: React.MouseEvent) => void;
  onToggleExpanded: () => void;
  onPresetsHeaderKeyDown: (_e: React.KeyboardEvent) => void;
  onShowSavePreset: () => void;
  onSavePreset: () => void;
  onSavePresetKeyDown: (_e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPresetNameChange: (_value: string) => void;
  onCancelSavePreset: () => void;
  styles: typeof styles;
};

function PresetSection({
  presets,
  currentPresetId,
  isPresetsExpanded,
  isPresetsHeaderCollapsed,
  showSavePreset,
  presetName,
  onLoadPreset,
  onDeletePreset,
  onToggleExpanded,
  onPresetsHeaderKeyDown,
  onShowSavePreset,
  onSavePreset,
  onSavePresetKeyDown,
  onPresetNameChange,
  onCancelSavePreset,
  styles,
}: PresetSectionProps) {
  return (
    <div className={styles.presetsSection}>
      <div 
        className={`${styles.presetsHeader} ${isPresetsHeaderCollapsed ? styles.presetsHeaderCollapsed : ''}`}
        onClick={onToggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={onPresetsHeaderKeyDown}
        aria-label={isPresetsExpanded ? 'Collapse presets' : 'Expand presets'}
        aria-expanded={isPresetsExpanded}
      >
        <h4 className={styles.presetsTitle}>Choose a theme</h4>
        <button
          className={styles.presetsToggle}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpanded();
          }}
          aria-label={isPresetsExpanded ? 'Collapse presets' : 'Expand presets'}
          aria-expanded={isPresetsExpanded}
        >
          {isPresetsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      {showSavePreset && isPresetsExpanded ? (
        <PresetNameField
          presetName={presetName}
          onPresetNameChange={onPresetNameChange}
          onSavePresetKeyDown={onSavePresetKeyDown}
          onSavePreset={onSavePreset}
          onCancelSavePreset={onCancelSavePreset}
        />
      ) : null}
      <div className={`${styles.presetsGrid} ${!isPresetsExpanded ? styles.presetsGridCollapsed : ''}`}>
        {presets.map((preset) => {
          const isBuiltIn = isBuiltInPreset(preset.id);
          const showEasterEgg = hasAudioEasterEgg(preset.id);
          const isSelected = preset.id === currentPresetId;
          return (
            <div key={preset.id} className={styles.presetButtonWrapper}>
              <div
                role="button"
                tabIndex={0}
                className={styles.presetButton}
                onClick={() => onLoadPreset(preset.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onLoadPreset(preset.id);
                  }
                }}
                aria-label={`Select ${preset.name} theme`}
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
                        onDeletePreset(preset.id, e);
                      }}
                      aria-label={`Delete ${preset.name} preset`}
                      title="Delete preset"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div className={styles.savePresetContainer}>
          <button
            className={styles.savePresetButton}
            onClick={onShowSavePreset}
            style={{ display: showSavePreset ? 'none' : 'flex' }}
          >
            <Bookmark size={14} />
            <span>Save as Preset</span>
          </button>
        </div>
      </div>
    </div>
  );
}

type SharedColorProps = {
  localChanges: Partial<ReturnType<typeof useTheme>['theme']>;
  theme: ReturnType<typeof useTheme>['theme'];
  onColorChange: (_key: keyof ReturnType<typeof useTheme>['theme'], _value: string) => void;
  onCancel: (_key: keyof ReturnType<typeof useTheme>['theme']) => void;
  colorToHex: (_color: string) => string;
  highlightedKeys: ReadonlySet<string>;
  styles: typeof styles;
};

function TokenColorList({
  tokens,
  localChanges,
  theme,
  onColorChange,
  onCancel,
  colorToHex,
  highlightedKeys,
  styles,
}: SharedColorProps & { tokens: ColorToken[] }) {
  return (
    <div className={styles.colors}>
      {tokens.map((token) => {
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
            highlightedKeys={highlightedKeys}
            styles={styles}
          />
        );
      })}
    </div>
  );
}

function gradientPair(tokens: ColorToken[], partner: string, key: string): ColorToken[] {
  return tokens.filter((token) => token.gradientPartner === partner || token.key === key);
}

type GradientCategoryBodyProps = SharedColorProps & {
  tokens: ColorToken[];
  previews: {
    hero: string;
    campaign: string;
    authorBox: string;
    related: string;
  };
};

function GradientCategoryBody({
  tokens,
  previews,
  localChanges,
  theme,
  onColorChange,
  onCancel,
  colorToHex,
  highlightedKeys,
  styles,
}: GradientCategoryBodyProps) {
  const groups = [
    { id: 'hero', tokens: gradientPair(tokens, 'heroEnd', 'heroEnd'), preview: previews.hero },
    { id: 'campaign', tokens: gradientPair(tokens, 'campaignEnd', 'campaignEnd'), preview: previews.campaign },
    { id: 'author', tokens: gradientPair(tokens, 'authorBoxEnd', 'authorBoxEnd'), preview: previews.authorBox },
    { id: 'related', tokens: gradientPair(tokens, 'relatedSectionEnd', 'relatedSectionEnd'), preview: previews.related },
  ];

  return (
    <>
      {groups.map((group) => (
        <GradientGroup
          key={group.id}
          gradientTokens={group.tokens}
          gradientPreview={group.preview}
          localChanges={localChanges}
          theme={theme}
          onColorChange={onColorChange}
          onCancel={onCancel}
          colorToHex={colorToHex}
          highlightedKeys={highlightedKeys}
          styles={styles}
        />
      ))}
    </>
  );
}

function categoryContents(
  category: ColorToken['category'],
  tokens: ColorToken[],
  previews: GradientCategoryBodyProps['previews'],
  shared: SharedColorProps,
) {
  const categoryTokens = tokens.filter((token) => token.category === category);
  if (category === 'gradient') {
    return <GradientCategoryBody tokens={categoryTokens} previews={previews} {...shared} />;
  }
  return <TokenColorList tokens={categoryTokens} {...shared} />;
}

type ColorCategoriesProps = SharedColorProps & {
  colorTokens: ColorToken[];
  categoryLabels: Record<ColorToken['category'], string>;
  getGradientPreview: () => string;
  getCampaignGradientPreview: () => string;
  getAuthorBoxGradientPreview: () => string;
  getRelatedSectionGradientPreview: () => string;
  hideColorControlsUntilContrastIssue: boolean;
  hasContrastIssue: boolean;
  areColorControlsExpanded: boolean;
  onToggleColorControls: () => void;
};

function ColorCategories({
  colorTokens,
  categoryLabels,
  localChanges,
  theme,
  onColorChange,
  onCancel,
  colorToHex,
  highlightedKeys,
  getGradientPreview,
  getCampaignGradientPreview,
  getAuthorBoxGradientPreview,
  getRelatedSectionGradientPreview,
  hideColorControlsUntilContrastIssue,
  hasContrastIssue,
  areColorControlsExpanded,
  onToggleColorControls,
  styles,
}: ColorCategoriesProps) {
  if (!areColorControlsVisible(hideColorControlsUntilContrastIssue, hasContrastIssue)) {
    return null;
  }

  const shared = {
    localChanges,
    theme,
    onColorChange,
    onCancel,
    colorToHex,
    highlightedKeys,
    styles,
  };
  const previews = {
    hero: getGradientPreview(),
    campaign: getCampaignGradientPreview(),
    authorBox: getAuthorBoxGradientPreview(),
    related: getRelatedSectionGradientPreview(),
  };

  return (
    <div className={styles.colorsScrollArea}>
      <ColorCategorySection
        label={colorControlsLabel}
        expanded={areColorControlsExpanded}
        onToggle={onToggleColorControls}
      >
        {colorCategories.map((category) => (
          <ColorCategoryGroup key={category} label={categoryLabels[category]}>
            {categoryContents(category, colorTokens, previews, shared)}
          </ColorCategoryGroup>
        ))}
      </ColorCategorySection>
    </div>
  );
}

type ThemePickerProps = {
  /** Hide color controls until a contrast issue exists. Default is true. */
  hideColorControlsUntilContrastIssue?: boolean;
};

export function ThemePicker({
  hideColorControlsUntilContrastIssue = true,
}: ThemePickerProps = {}) {
  const { theme, updateTheme, resetTheme, presets, savePreset, loadPreset, deletePreset, currentPresetId } = useTheme();
  const [localChanges, setLocalChanges] = useState<Partial<typeof theme>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [isPresetsExpanded, setIsPresetsExpanded] = useState(false);
  const [areColorControlsExpanded, setAreColorControlsExpanded] = useState(false);
  const [highlightedKeys, setHighlightedKeys] = useState<string[]>([]);
  const [reviewedPair, setReviewedPair] = useState<string | null>(null);
  const [isPresetsHeaderCollapsed, setIsPresetsHeaderCollapsed] = useState(false);
  const [isTriggerHidden, setIsTriggerHidden] = useState(false);
  const [imagePreviewKey, setImagePreviewKey] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Keep checking after Review so a fixed pair can drop its red marks with the drawer closed.
  const contrastIssues = useMemo(() => {
    if (!isOpen && !reviewedPair) return [];
    
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
      accent: currentTheme.accent,
      heroStart: currentTheme.heroStart,
      heroEnd: currentTheme.heroEnd,
    });
  }, [theme, localChanges, isOpen, reviewedPair]);

  const highlightedKeySet = useMemo(() => {
    const failingPairs = new Set(contrastIssues.map((issue) => issue.pair));
    return new Set(highlightedKeysForOpenIssue(reviewedPair, highlightedKeys, failingPairs));
  }, [contrastIssues, highlightedKeys, reviewedPair]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleColorChange = useCallback((key: keyof typeof theme, value: string) => {
    setLocalChanges((prev) => ({ ...prev, [key]: value }));
    // Apply temporarily for preview
    const root = document.getElementById('root');
    if (root) {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    }
  }, []);

  const handleCancel = useCallback((key: keyof typeof theme) => {
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
  }, [theme]);

  const handleSave = useCallback(() => {
    if (Object.keys(localChanges).length > 0) {
      updateTheme(localChanges);
      setLocalChanges({});
    }
    setIsOpen(false);
  }, [localChanges, updateTheme]);

  const handleReset = useCallback(() => {
    resetTheme();
    setLocalChanges({});
    setIsOpen(false);
  }, [resetTheme]);

  const handleLoadPreset = useCallback((presetId: string) => {
    loadPreset(presetId);
    setLocalChanges({});
    setImagePreviewKey((key) => key + 1);
  }, [loadPreset]);

  const handleSavePreset = useCallback(() => {
    if (presetName.trim()) {
      // Create theme with current state + local changes
      const themeToSave = { ...theme, ...localChanges };
      // Save the preset
      savePreset(presetName.trim(), themeToSave);
      updateTheme(themeToSave);
      setLocalChanges({});
      setPresetName('');
      setShowSavePreset(false);
      setImagePreviewKey((key) => key + 1);
    }
  }, [presetName, theme, localChanges, savePreset, updateTheme]);

  const handleDeletePreset = useCallback((presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePreset(presetId);
  }, [deletePreset]);

  const handleToggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggleExpanded = useCallback(() => {
    setIsPresetsExpanded((prev) => !prev);
  }, []);

  const handleToggleColorControls = useCallback(() => {
    setAreColorControlsExpanded((current) => !current);
  }, []);

  const handleJumpToIssue = useCallback((pair: string) => {
    const targets = jumpTargetsForIssue(pair, colorTokenKeys);
    if (targets.length === 0) {
      return;
    }
    setIsPresetsExpanded(false);
    setAreColorControlsExpanded(true);
    setReviewedPair(pair);
    setHighlightedKeys(targets);
    reviewContrastOnPage(pair);
  }, []);

  useEffect(() => {
    scrollToColorControl(highlightedKeys[0], areColorControlsExpanded);
  }, [areColorControlsExpanded, highlightedKeys]);

  useEffect(() => {
    if (!reviewedPair) {
      return;
    }
    const stillFailing = contrastIssues.some((issue) => issue.pair === reviewedPair);
    if (stillFailing) {
      return;
    }
    clearContrastReviewMark();
  }, [contrastIssues, reviewedPair]);

  const handleShowSavePreset = useCallback(() => {
    setIsPresetsExpanded(true);
    setShowSavePreset(true);
  }, []);

  const handlePresetNameChange = useCallback((value: string) => {
    setPresetName(value);
  }, []);

  const handleCancelSavePreset = useCallback(() => {
    setShowSavePreset(false);
    setPresetName('');
  }, []);
  const handleApplyImageTheme = useCallback((nextTheme: Theme) => {
    setLocalChanges(nextTheme);
    applyThemePreview(nextTheme);
  }, []);

  const handleRequestImageSave = useCallback(() => {
    setIsPresetsExpanded(true);
    setShowSavePreset(true);
  }, []);

  // Close on backdrop click (but not when clicking the trigger button or drawer)
  useEffect(() => {
    if (!isOpen) return;
    
    const handleBackdropClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const isBackdropClick = backdropRef.current === target;
      const isNotTrigger = triggerRef.current && !triggerRef.current.contains(target);
      
      if (isBackdropClick && isNotTrigger) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleBackdropClick);
    return () => document.removeEventListener('mousedown', handleBackdropClick);
  }, [isOpen]);

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (!isOpen) return;
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Control trigger icon visibility with delay when drawer closes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsTriggerHidden(true), 0);
      return;
    }
    
    const timer = setTimeout(() => {
      setIsTriggerHidden(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Control presets header margin with delay when closing
  useEffect(() => {
    if (isPresetsExpanded) {
      setTimeout(() => setIsPresetsHeaderCollapsed(false), 0);
      return;
    }
    
    const timer = setTimeout(() => {
      setIsPresetsHeaderCollapsed(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [isPresetsExpanded]);

  // Memoize colorToHex to prevent recreation on every render
  const colorToHex = useCallback((color: string): string => {
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
  }, []);

  // Memoize gradient preview functions to prevent recalculation on every render
  const getGradientPreview = useCallback(() => {
    const start = localChanges.heroStart ?? theme.heroStart;
    const end = localChanges.heroEnd ?? theme.heroEnd;
    return `linear-gradient(180deg, ${start}, ${end})`;
  }, [localChanges.heroStart, localChanges.heroEnd, theme.heroStart, theme.heroEnd]);

  const getCampaignGradientPreview = useCallback(() => {
    const start = localChanges.campaignStart ?? theme.campaignStart;
    const end = localChanges.campaignEnd ?? theme.campaignEnd;
    return `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
  }, [localChanges.campaignStart, localChanges.campaignEnd, theme.campaignStart, theme.campaignEnd]);

  const getAuthorBoxGradientPreview = useCallback(() => {
    const start = localChanges.authorBoxStart ?? theme.authorBoxStart;
    const end = localChanges.authorBoxEnd ?? theme.authorBoxEnd;
    return `linear-gradient(${start}, ${end})`;
  }, [localChanges.authorBoxStart, localChanges.authorBoxEnd, theme.authorBoxStart, theme.authorBoxEnd]);

  const getRelatedSectionGradientPreview = useCallback(() => {
    const start = localChanges.relatedSectionStart ?? theme.relatedSectionStart;
    const end = localChanges.relatedSectionEnd ?? theme.relatedSectionEnd;
    return `linear-gradient(${start}, ${end} 115%)`;
  }, [localChanges.relatedSectionStart, localChanges.relatedSectionEnd, theme.relatedSectionStart, theme.relatedSectionEnd]);

  // Memoize keyboard handlers
  const handlePresetsHeaderKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsPresetsExpanded((prev) => !prev);
    }
  }, []);

  const handleSavePresetKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSavePreset();
    } else if (e.key === 'Escape') {
      setShowSavePreset(false);
      setPresetName('');
    }
  }, [handleSavePreset]);

  return (
    <>
      <button
        ref={triggerRef}
        className={`${styles.trigger} ${isTriggerHidden ? styles.triggerHidden : ''}`}
        onClick={handleToggleOpen}
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
                onClick={handleClose}
                className={styles.closeBtn}
                aria-label="Close"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className={styles.contentArea}>
            <ContrastWarnings
              contrastIssues={contrastIssues}
              availableKeys={colorTokenKeys}
              onJumpToIssue={handleJumpToIssue}
            />

            <ImageThemeUpload
              onApply={handleApplyImageTheme}
              onSave={handleRequestImageSave}
              previewResetKey={imagePreviewKey}
            />

            {/* Presets Section */}
            <PresetSection
              presets={presets}
              currentPresetId={currentPresetId}
              isPresetsExpanded={isPresetsExpanded}
              isPresetsHeaderCollapsed={isPresetsHeaderCollapsed}
              showSavePreset={showSavePreset}
              presetName={presetName}
              onLoadPreset={handleLoadPreset}
              onDeletePreset={handleDeletePreset}
              onToggleExpanded={handleToggleExpanded}
              onPresetsHeaderKeyDown={handlePresetsHeaderKeyDown}
              onShowSavePreset={handleShowSavePreset}
              onSavePreset={handleSavePreset}
              onSavePresetKeyDown={handleSavePresetKeyDown}
              onPresetNameChange={handlePresetNameChange}
              onCancelSavePreset={handleCancelSavePreset}
              styles={styles}
            />

            <ColorCategories
              colorTokens={colorTokens}
              categoryLabels={categoryLabels}
              localChanges={localChanges}
              theme={theme}
              onColorChange={handleColorChange}
              onCancel={handleCancel}
              colorToHex={colorToHex}
              highlightedKeys={highlightedKeySet}
              getGradientPreview={getGradientPreview}
              getCampaignGradientPreview={getCampaignGradientPreview}
              getAuthorBoxGradientPreview={getAuthorBoxGradientPreview}
              getRelatedSectionGradientPreview={getRelatedSectionGradientPreview}
              hideColorControlsUntilContrastIssue={hideColorControlsUntilContrastIssue}
              hasContrastIssue={contrastIssues.length > 0}
              areColorControlsExpanded={areColorControlsExpanded}
              onToggleColorControls={handleToggleColorControls}
              styles={styles}
            />
          </div>
        </div>
      </>
    </>
  );
}

