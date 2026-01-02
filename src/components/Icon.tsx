import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function Icon({ icon: IconComp, size = 20, strokeWidth = 2, className }: Props) {
  return <IconComp width={size} height={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
