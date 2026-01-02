import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  const v = variant === "secondary" ? styles.secondary : styles.primary;
  return <button className={[v, className].filter(Boolean).join(" ")} {...props} />;
}
