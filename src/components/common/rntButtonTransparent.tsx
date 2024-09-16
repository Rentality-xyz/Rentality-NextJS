import { cn } from "@/utils";
import { MouseEventHandler } from "react";

interface RntButtonTransparentProps extends React.ComponentPropsWithoutRef<"button"> {}

export default function RntButtonTransparent({
  className,
  type,
  children,
  onClick,
  disabled,
  ...props
}: RntButtonTransparentProps) {
  const bgColor = disabled ? "bg-gray-500" : "border-gradient";
  const c = cn("h-12 w-56 rounded-full text-white text-lg", bgColor, className);
  return (
    <button
      type={type === "submit" ? "submit" : undefined}
      disabled={disabled}
      {...props}
      className={c}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
