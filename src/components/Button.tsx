import type { ButtonHTMLAttributes } from "react";
import { ChevronRight } from "lucide-react";
import styles from "./Button.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  showChevron?: boolean;
};

export function Button({ variant = "primary", className, showChevron = false, children, ...props }: Props) {
  const v = variant === "secondary" ? styles.secondary : styles.primary;
  return (
    <button className={[v, className].filter(Boolean).join(" ")} {...props}>
      {children}
      {showChevron && variant === "primary" && (
        <ChevronRight className={styles.chevron} size={10} />
      )}
    </button>
  );
}
