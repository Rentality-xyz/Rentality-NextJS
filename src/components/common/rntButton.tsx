import { twMerge } from "tailwind-merge";
import React from "react";

interface RntButtonProps extends React.ComponentPropsWithoutRef<"button"> {}

export default function RntButton({ className, children, ...restProps }: RntButtonProps) {
  const bgColor = !className?.includes("bg-") ? "buttonGradient" : "";
  const c = twMerge("h-12 w-56 rounded-full text-white text-lg disabled:bg-gray-500 " + bgColor, className);

  return (
    <button className={c} {...restProps}>
      {children}
    </button>
  );
}
