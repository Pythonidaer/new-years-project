import type { PropsWithChildren } from "react";
import styles from "./Section.module.css";

type Props = PropsWithChildren<{
  className?: string;
  variant?: "default" | "alt";
  id?: string;
}>;

export function Section({ className, variant = "default", id, children }: Props) {
  return (
    <section
      id={id}
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
