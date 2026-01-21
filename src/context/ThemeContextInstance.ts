import { createContext } from 'react';
import type { Theme, Preset } from './themeData';

export type ThemeContextType = {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => void;
  resetTheme: () => void;
  exportTheme: () => string;
  importTheme: (themeJson: string) => void;
  presets: Preset[];
  savePreset: (name: string, themeToSave?: Theme) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  currentPresetId: string | null;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

