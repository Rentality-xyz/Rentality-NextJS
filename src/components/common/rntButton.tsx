import { cn } from "@/utils";
import React from "react";

interface RntButtonProps extends React.ComponentPropsWithoutRef<"button"> {}

export default function RntButton({ className, disabled, type, children, ...restProps }: RntButtonProps) {
  const bgColor = disabled ? "bg-gray-500" : "buttonGradient";
  const c = cn("h-12 w-56 rounded-full text-white text-lg", bgColor, className);

  return (
    <button className={c} type={type} disabled={disabled} {...restProps}>
      {children}
    </button>
  );
}
