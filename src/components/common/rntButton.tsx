import { cn } from "@/utils";
import React from "react";

interface RntButtonProps extends React.ComponentPropsWithoutRef<"button"> {}

export default function RntButton({ className, type, children, ...restProps }: RntButtonProps) {
  const bgColor = !className?.includes("bg-") ? "buttonGradient" : "";
  type = type??"button";
  const c = cn("h-12 w-56 rounded-full text-white text-lg disabled:bg-gray-500 ", bgColor, className);

  return (
    <button className={c} type={type} {...restProps}>
      {children}
    </button>
  );
}
