import type { ButtonHTMLAttributes } from "react";
import { ChevronRight } from "lucide-react";
import styles from "./Button.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "secondary-orange";
  showChevron?: boolean;
  chevronPosition?: "left" | "right";
};

export function Button({ 
  variant = "primary", 
  className, 
  showChevron = false, 
  chevronPosition = "right",
  children, 
  ...props 
}: Props) {
  const v = variant === "secondary" ? styles.secondary : variant === "secondary-orange" ? styles.secondaryOrange : styles.primary;
  const shouldShowChevron = showChevron && (variant === "primary" || variant === "secondary-orange");
  
  return (
    <button className={[v, className].filter(Boolean).join(" ")} {...props}>
      {shouldShowChevron && chevronPosition === "left" && (
        <ChevronRight className={styles.chevronLeft} size={10} />
      )}
      {children}
      {shouldShowChevron && chevronPosition === "right" && (
        <ChevronRight className={styles.chevron} size={10} />
      )}
    </button>
  );
}
