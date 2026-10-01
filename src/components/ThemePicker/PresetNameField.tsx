import type { KeyboardEvent } from 'react';
import { Save, X } from 'lucide-react';
import styles from './ThemePicker.module.css';

type PresetNameFieldProps = {
  presetName: string;
  onPresetNameChange: (_value: string) => void;
  onSavePresetKeyDown: (_event: KeyboardEvent<HTMLInputElement>) => void;
  onSavePreset: () => void;
  onCancelSavePreset: () => void;
};

export function PresetNameField({
  presetName,
  onPresetNameChange,
  onSavePresetKeyDown,
  onSavePreset,
  onCancelSavePreset,
}: PresetNameFieldProps) {
  return (
    <div className={styles.savePresetForm}>
      <input
        id="preset-name-input"
        type="text"
        placeholder="Preset name..."
        value={presetName}
        onChange={(event) => onPresetNameChange(event.target.value)}
        onKeyDown={onSavePresetKeyDown}
        className={styles.presetNameInput}
        autoFocus
      />
      <button
        type="button"
        className={styles.savePresetConfirm}
        onClick={onSavePreset}
        disabled={!presetName.trim()}
        aria-label="Save preset"
      >
        <Save size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.savePresetCancel}
        onClick={onCancelSavePreset}
        aria-label="Cancel preset"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
