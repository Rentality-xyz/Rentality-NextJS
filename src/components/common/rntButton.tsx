import { cn } from "@/utils";
import React from "react";

interface RntButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  isVisibleCircle?: boolean;
}

export default function RntButton({ className, type, children, isVisibleCircle = true, ...restProps }: RntButtonProps) {
  const bgColor = !className?.includes("bg-") ? "buttonGradient" : "";
  type = type ?? "button";
  const c = cn(
    "transition duration-150 py-1 h-12 w-56 rounded-full text-white text-lg disabled:cursor-default disabled:text-rnt-text-button-disabled disabled:bg-rnt-button-disabled",
    !restProps.disabled && "active:scale-95 active:opacity-75",
    bgColor,
    className
  );

  return (
    <button className={c} type={type} {...restProps}>
      {children}
      <span className={`ml-4 ${!isVisibleCircle && "hidden"}`}>●</span>
    </button>
  );
}
