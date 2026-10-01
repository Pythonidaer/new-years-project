import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Info, Save } from 'lucide-react';
import type { Theme } from '@/context/themes/types';
import { imageFileError, readImagePixels, themeFromPixels } from '@/utils/imageTheme';
import styles from './ThemePicker.module.css';

type ImageThemeUploadProps = {
  onApply: (_theme: Theme) => void;
  onSave: () => void;
  previewResetKey?: number;
};

type ImagePreview = {
  key: number | undefined;
  colors: string[];
};

const IMAGE_FILE_HINT = 'Preview a theme from a photo. 20 MB max.';
const IMAGE_PROCESSING_LABEL = 'Processing image...';

function colorsForPreview(
  preview: ImagePreview,
  previewResetKey: number | undefined,
): string[] {
  if (preview.key !== previewResetKey) {
    return [];
  }
  return preview.colors;
}

async function applySelectedFile(
  file: File,
  onApply: (_theme: Theme) => void,
  setError: (_message: string) => void,
  setSwatches: (_colors: string[]) => void,
  isCurrent: () => boolean,
): Promise<void> {
  try {
    const pixels = await readImagePixels(file);
    if (!isCurrent()) {
      return;
    }
    const result = themeFromPixels(pixels);
    setError('');
    setSwatches(result.swatches);
    onApply(result.theme);
  } catch (error) {
    if (!isCurrent()) {
      return;
    }
    console.warn('Failed to read theme image:', error);
    setError('Could not read that image.');
    setSwatches([]);
  }
}

export function ImageThemeUpload({
  onApply,
  onSave,
  previewResetKey,
}: ImageThemeUploadProps) {
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<ImagePreview>({
    key: previewResetKey,
    colors: [],
  });
  const requestId = useRef(0);
  const latestFile = useRef<File | null>(null);
  const running = useRef(false);
  const previewKeyRef = useRef(previewResetKey);
  const onApplyRef = useRef(onApply);
  previewKeyRef.current = previewResetKey;
  onApplyRef.current = onApply;
  const swatches = colorsForPreview(preview, previewResetKey);

  const storeSwatches = (colors: string[]) => {
    setPreview({ key: previewKeyRef.current, colors });
  };

  useEffect(() => {
    requestId.current += 1;
    latestFile.current = null;
    setProcessing(false);
  }, [previewResetKey]);

  const drainQueue = async () => {
    try {
      while (latestFile.current) {
        const file = latestFile.current;
        latestFile.current = null;
        const id = requestId.current;
        const key = previewKeyRef.current;
        await applySelectedFile(
          file,
          (theme) => onApplyRef.current(theme),
          setError,
          storeSwatches,
          () => requestId.current === id && previewKeyRef.current === key,
        );
      }
    } finally {
      running.current = false;
      setProcessing(false);
    }
  };

  // One decode runs at a time. A newer photo replaces any sample still in flight.
  const runNext = () => {
    if (running.current) {
      return;
    }
    running.current = true;
    void drainQueue();
  };

  const rejectSelectedFile = (message: string) => {
    requestId.current += 1;
    latestFile.current = null;
    setError(message);
    storeSwatches([]);
    setProcessing(false);
  };

  const queueSelectedFile = (file: File) => {
    requestId.current += 1;
    latestFile.current = file;
    setProcessing(true);
    setError('');
    storeSwatches([]);
    runNext();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    const message = imageFileError(file);
    if (message) {
      rejectSelectedFile(message);
      return;
    }
    queueSelectedFile(file);
  };

  return (
    <section className={styles.imageTheme} aria-busy={processing}>
      <div className={styles.imageThemeHeader}>
        <div className={styles.imageThemeHeading}>
          <h4 className={styles.imageThemeTitle}>Create from image</h4>
          <span className={styles.imageThemeInfo}>
            <button
              type="button"
              className={styles.imageThemeInfoButton}
              aria-label={IMAGE_FILE_HINT}
            >
              <Info size={14} aria-hidden="true" />
            </button>
            <span className={styles.imageThemeHint} role="tooltip" aria-hidden="true">
              {IMAGE_FILE_HINT}
            </span>
          </span>
        </div>
        {swatches.length > 0 ? (
          <ul className={styles.swatchRow} aria-label="Extracted colors">
            {swatches.map((swatch) => (
              <li
                key={swatch}
                className={styles.swatch}
                style={{ backgroundColor: swatch }}
                aria-label={swatch}
              />
            ))}
          </ul>
        ) : null}
        <div className={styles.imageThemeActions}>
          <label className={styles.imageThemeLabel}>
            Upload
            <input
              type="file"
              accept="image/*"
              className={styles.imageThemeInput}
              onChange={handleChange}
            />
          </label>
          {swatches.length > 0 ? (
            <button
              type="button"
              className={styles.imageThemeSave}
              onClick={onSave}
              aria-label="Save image theme"
            >
              <Save size={14} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
      {processing ? (
        <p className={styles.imageThemeStatus} role="status">{IMAGE_PROCESSING_LABEL}</p>
      ) : null}
      {error ? <p className={styles.imageThemeError} role="alert">{error}</p> : null}
    </section>
  );
}
