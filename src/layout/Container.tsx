import type { PropsWithChildren, ElementType } from "react";
import styles from "./Container.module.css";

type Props = PropsWithChildren<{
  as?: ElementType;
  className?: string;
}>;

export function Container({ as: Tag = "div", className, children }: Props) {
  return (
    <Tag className={[styles.container, className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
