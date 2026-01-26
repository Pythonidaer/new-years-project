import { createContext } from 'react';
import type { Theme, Preset } from './themeData';

export type ThemeContextType = {
  theme: Theme;
  updateTheme: (_updates: Partial<Theme>) => void;
  resetTheme: () => void;
  exportTheme: () => string;
  importTheme: (_themeJson: string) => void;
  presets: Preset[];
  savePreset: (_name: string, _themeToSave?: Theme) => void;
  loadPreset: (_presetId: string) => void;
  deletePreset: (_presetId: string) => void;
  currentPresetId: string | null;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

