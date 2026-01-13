import type { ButtonHTMLAttributes } from "react";
import { FaCaretRight, FaCaretLeft } from "react-icons/fa";
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
        <FaCaretLeft className={styles.chevronLeft} size={16} />
      )}
      {children}
      {shouldShowChevron && chevronPosition === "right" && (
        <FaCaretRight className={styles.chevron} size={16} />
      )}
    </button>
  );
}
