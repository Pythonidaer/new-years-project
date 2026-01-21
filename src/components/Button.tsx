import type { ButtonHTMLAttributes, ReactElement } from "react";
import { FaCaretRight, FaCaretLeft } from "react-icons/fa";
import styles from "./Button.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "secondary-orange";
  showChevron?: boolean;
  chevronPosition?: "left" | "right";
};

function getVariantClass(variant: Props["variant"]): string {
  if (variant === "secondary") {
    return styles.secondary;
  }
  if (variant === "secondary-orange") {
    return styles.secondaryOrange;
  }
  return styles.primary;
}

function shouldDisplayChevron(
  showChevron: boolean,
  variant: Props["variant"]
): boolean {
  if (!showChevron) {
    return false;
  }
  return variant === "primary" || variant === "secondary-orange";
}

function renderLeftChevron(shouldShow: boolean): ReactElement | null {
  if (!shouldShow) {
    return null;
  }
  return <FaCaretLeft className={styles.chevronLeft} size={16} />;
}

function renderRightChevron(shouldShow: boolean): ReactElement | null {
  if (!shouldShow) {
    return null;
  }
  return <FaCaretRight className={styles.chevron} size={16} />;
}

export function Button({ 
  variant = "primary", 
  className, 
  showChevron = false, 
  chevronPosition = "right",
  children, 
  ...props 
}: Props) {
  const variantClass = getVariantClass(variant);
  const shouldShowChevron = shouldDisplayChevron(showChevron, variant);
  const showLeftChevron = shouldShowChevron && chevronPosition === "left";
  const showRightChevron = shouldShowChevron && chevronPosition === "right";
  
  return (
    <button className={[variantClass, className].filter(Boolean).join(" ")} {...props}>
      {renderLeftChevron(showLeftChevron)}
      {children}
      {renderRightChevron(showRightChevron)}
    </button>
  );
}
