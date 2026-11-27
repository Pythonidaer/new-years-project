import type { ReactNode } from "react";
import { formatContrastRatio } from "./formatRatio";
import styles from "./ColorContrast.module.css";

type ToolFrameProps = {
  title: string;
  children: ReactNode;
};

export function ToolFrame({ title, children }: ToolFrameProps) {
  return (
    <section className={styles.tool} data-blog-tool-root aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </section>
  );
}

type ContrastPreviewProps = {
  foreground: string;
  background: string;
};

export function ContrastPreview({ foreground, background }: ContrastPreviewProps) {
  return (
    <div
      className={styles.preview}
      style={{ backgroundColor: background }}
      data-testid="contrast-preview"
    >
      <div className={styles.previewSample} style={{ color: foreground }}>
        Sample text
      </div>
    </div>
  );
}

type ContrastReadoutProps = {
  foreground: string;
  background: string;
  ratio: number;
  boundaries: number[];
};

export function ContrastReadout({
  foreground,
  background,
  ratio,
  boundaries,
}: ContrastReadoutProps) {
  return (
    <dl className={styles.readout}>
      <div className={styles.readoutRow}>
        <dt className={styles.term}>Foreground</dt>
        <dd className={styles.value}>{foreground}</dd>
      </div>
      <div className={styles.readoutRow}>
        <dt className={styles.term}>Background</dt>
        <dd className={styles.value}>{background}</dd>
      </div>
      <div className={styles.readoutRow}>
        <dt className={styles.term}>Contrast ratio</dt>
        <dd className={styles.value}>{formatContrastRatio(ratio, boundaries)}</dd>
      </div>
    </dl>
  );
}

type LiveStatusProps = {
  message: string;
};

export function LiveStatus({ message }: LiveStatusProps) {
  return (
    <div className={styles.live} aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}

type GenerateButtonProps = {
  label: string;
  onGenerate: () => void;
};

export function GenerateButton({ label, onGenerate }: GenerateButtonProps) {
  return (
    <button type="button" className={styles.generate} onClick={onGenerate}>
      {label}
    </button>
  );
}
