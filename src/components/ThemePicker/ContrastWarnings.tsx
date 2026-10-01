import { Info } from 'lucide-react';
import type { ContrastIssue } from '@/utils/contrast';
import { jumpTargetsForIssue } from '@/utils/contrastJump';
import styles from './ThemePicker.module.css';

const CONTRAST_HINT = 'These colors are too similar, so some people cannot read the text.';

type ContrastWarningsProps = {
  contrastIssues: ContrastIssue[];
  availableKeys: ReadonlySet<string>;
  onJumpToIssue: (_pair: string) => void;
};

type WarningJumpButtonProps = {
  pair: string;
  availableKeys: ReadonlySet<string>;
  onJumpToIssue: (_pair: string) => void;
};

function WarningJumpButton({ pair, availableKeys, onJumpToIssue }: WarningJumpButtonProps) {
  const targets = jumpTargetsForIssue(pair, availableKeys);
  if (targets.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      className={styles.warningJump}
      onClick={() => onJumpToIssue(pair)}
      aria-label={`Jump to ${pair}`}
    >
      Review
    </button>
  );
}

export function ContrastWarnings({
  contrastIssues,
  availableKeys,
  onJumpToIssue,
}: ContrastWarningsProps) {
  if (contrastIssues.length === 0) {
    return null;
  }

  return (
    <div className={styles.warnings}>
      <div className={styles.warningHeading}>
        <h4 className={styles.warningTitle}>Contrast Warnings</h4>
        <span className={styles.imageThemeInfo}>
          <button
            type="button"
            className={styles.imageThemeInfoButton}
            aria-label={CONTRAST_HINT}
          >
            <Info size={14} aria-hidden="true" />
          </button>
          <span className={`${styles.imageThemeHint} ${styles.warningHint}`} role="tooltip" aria-hidden="true">
            {CONTRAST_HINT}
          </span>
        </span>
      </div>
      {contrastIssues.map((issue) => (
        <div key={issue.pair} className={styles.warning}>
          <div className={styles.warningHeader}>
            <span className={styles.warningPair}>{issue.pair}</span>
            <WarningJumpButton
              pair={issue.pair}
              availableKeys={availableKeys}
              onJumpToIssue={onJumpToIssue}
            />
          </div>
          <div className={styles.warningDetails}>
            <div className={styles.warningUsage}>
              <strong>Used in:</strong> {issue.usage}
            </div>
            <div className={styles.warningRatio}>
              <strong>Contrast Ratio:</strong> {issue.ratio.toFixed(2)}:1 (needs ≥4.5:1)
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
