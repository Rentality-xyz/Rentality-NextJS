import { cn } from "@/utils";
import React from "react";

interface RntButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  minHeight?: string;
  isVisibleCircle?: boolean;
}

export default function RntButton({
  className,
  type,
  children,
  minHeight = "48px",
  isVisibleCircle = true,
  ...restProps
}: RntButtonProps) {
  const bgColor = !className?.includes("bg-") ? "buttonGradient" : "";
  type = type ?? "button";
  const c = cn(
    "transition duration-150 py-1 w-56 rounded-full text-white text-lg disabled:cursor-not-allowed disabled:text-rnt-text-button-disabled disabled:bg-rnt-button-disabled",
    !restProps.disabled && "active:scale-95 active:opacity-75",
    `min-h-[${minHeight}]`,
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
