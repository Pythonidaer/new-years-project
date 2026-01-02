import type { PropsWithChildren } from "react";
import styles from "./Section.module.css";

type Props = PropsWithChildren<{
  className?: string;
  variant?: "default" | "alt";
}>;

export function Section({ className, variant = "default", children }: Props) {
  return (
    <section
      className={[
        styles.section,
        variant === "alt" ? styles.alt : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
