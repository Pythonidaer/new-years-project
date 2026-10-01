import type { KeyboardEvent, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './ThemePicker.module.css';

type ColorCategorySectionProps = {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
};

type ColorCategoryGroupProps = {
  label: string;
  children: ReactNode;
};

function handleHeaderKeyDown(event: KeyboardEvent, onToggle: () => void): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onToggle();
  }
}

export function ColorCategorySection({
  label,
  expanded,
  onToggle,
  children,
}: ColorCategorySectionProps) {
  const action = expanded ? 'Collapse' : 'Expand';
  const labelText = `${action} ${label}`;

  return (
    <div className={styles.colorCategory}>
      <div
        className={`${styles.categoryHeader} ${expanded ? '' : styles.categoryHeaderCollapsed}`}
        onClick={onToggle}
        onKeyDown={(event) => handleHeaderKeyDown(event, onToggle)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={labelText}
      >
        <h4 className={styles.categoryTitle}>{label}</h4>
        <button
          type="button"
          className={styles.categoryToggle}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          aria-expanded={expanded}
          aria-label={labelText}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      <div className={expanded ? undefined : styles.categoryBodyCollapsed}>
        {children}
      </div>
    </div>
  );
}

export function ColorCategoryGroup({ label, children }: ColorCategoryGroupProps) {
  return (
    <div className={`${styles.colorCategory} ${styles.categoryGroup}`}>
      <h4 className={styles.categoryTitle}>{label}</h4>
      {children}
    </div>
  );
}
