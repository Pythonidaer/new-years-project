import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './ThemeContextInstance';
import type { Theme, Preset } from './themeData';
import { defaultTheme, builtInPresets } from './themeData';

export type { Theme, Preset } from './themeData';
export type { ThemeContextType } from './ThemeContextInstance';

const STORAGE_KEY = 'user-theme';
const PRESETS_STORAGE_KEY = 'theme-presets';

// Helper to map theme keys to CSS variable names
function themeKeyToCssVar(key: keyof Theme): string {
  const kebabCase = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `--color-${kebabCase}`;
}

// Apply theme to DOM
function applyThemeToDom(theme: Theme) {
  const root = document.getElementById('root');
  if (!root) return;

  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = themeKeyToCssVar(key as keyof Theme);
    root.style.setProperty(cssVar, value);
  });

  // Also apply --color-bg to html/body so body element can use it
  // (body is a parent of #root, so it can't access variables defined on #root)
  const html = document.documentElement;
  html.style.setProperty('--color-bg', theme.bg);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load from localStorage on mount (prevents flicker)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...defaultTheme, ...parsed };
        } catch {
          return defaultTheme;
        }
      }
    }
    return defaultTheme;
  });

  const [presets, setPresets] = useState<Preset[]>(() => {
    // Load custom presets from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return [...builtInPresets, ...parsed];
        } catch {
          return builtInPresets;
        }
      }
    }
    return builtInPresets;
  });

  const [currentPresetId, setCurrentPresetId] = useState<string | null>(() => {
    // Try to determine current preset ID from saved theme
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Find matching preset
          const allPresets = [...builtInPresets];
          const savedPresets = localStorage.getItem(PRESETS_STORAGE_KEY);
          if (savedPresets) {
            try {
              allPresets.push(...JSON.parse(savedPresets));
            } catch {
              // Ignore invalid JSON in localStorage - use built-in presets only
            }
          }
          const matchingPreset = allPresets.find((p) => {
            return Object.keys(p.theme).every((key) => {
              return p.theme[key as keyof Theme] === parsed[key as keyof Theme];
            });
          });
          return matchingPreset?.id || null;
        } catch {
          return null;
        }
      }
    }
    // Default to 'default' theme if no saved theme found
    return 'default';
  });

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  const updateTheme = (updates: Partial<Theme>) => {
    setTheme((prev) => {
      const updated = { ...prev, ...updates };
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    setCurrentPresetId('default');
    localStorage.removeItem(STORAGE_KEY);
    // Reapply default theme to DOM
    applyThemeToDom(defaultTheme);
  };

  const exportTheme = () => {
    return JSON.stringify(theme, null, 2);
  };

  const importTheme = (themeJson: string) => {
    try {
      const parsed = JSON.parse(themeJson);
      const updated = { ...defaultTheme, ...parsed };
      setTheme(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      applyThemeToDom(updated);
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
  };

  const savePreset = (name: string, themeToSave?: Theme) => {
    const themeForPreset = themeToSave || theme;
    const newPreset: Preset = {
      id: `custom-${Date.now()}`,
      name,
      theme: { ...themeForPreset },
    };
    const customPresets = presets.filter((p) => !builtInPresets.find((bp) => bp.id === p.id));
    const updated = [...builtInPresets, ...customPresets, newPreset];
    setPresets(updated);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(customPresets.concat(newPreset)));
  };

  const loadPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setTheme(preset.theme);
      setCurrentPresetId(presetId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preset.theme));
      applyThemeToDom(preset.theme);
    }
  };

  const deletePreset = (presetId: string) => {
    // Don't allow deleting built-in presets
    if (builtInPresets.find((p) => p.id === presetId)) {
      return;
    }
    const customPresets = presets.filter((p) => p.id !== presetId && !builtInPresets.find((bp) => bp.id === p.id));
    const updated = [...builtInPresets, ...customPresets];
    setPresets(updated);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(customPresets));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        resetTheme,
        exportTheme,
        importTheme,
        presets,
        savePreset,
        loadPreset,
        deletePreset,
        currentPresetId,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}


