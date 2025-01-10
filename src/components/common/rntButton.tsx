import { cn } from "@/utils";
import React from "react";

interface RntButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  minHeight?: string;
}

export default function RntButton({ className, type, children, minHeight = "48px", ...restProps }: RntButtonProps) {
  const bgColor = !className?.includes("bg-") ? "buttonGradient" : "";
  type = type ?? "button";
  const c = cn(
    `transition duration-150 active:scale-95 active:opacity-75 py-1 w-56 rounded-full text-white text-lg disabled:bg-gray-500 min-h-[${minHeight}]`,
    bgColor,
    className
  );

  return (
    <button className={c} type={type} {...restProps}>
      {children}
    </button>
  );
}
