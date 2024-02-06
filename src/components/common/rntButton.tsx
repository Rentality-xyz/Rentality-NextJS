import { twMerge } from "tailwind-merge";
import React from "react";

interface RntButtonProps extends React.ComponentPropsWithoutRef<"button"> {}

export default function RntButton({ className, disabled, type, children, ...restProps }: RntButtonProps) {
  const bgColor = disabled ? "bg-gray-500" : "buttonGradient";
  const c = twMerge("h-12 w-56 rounded-full text-white text-lg " + bgColor, className);
  return (
    <button className={c} type={type === "submit" ? "submit" : undefined} disabled={disabled} {...restProps}>
      {children}
    </button>
  );
}
