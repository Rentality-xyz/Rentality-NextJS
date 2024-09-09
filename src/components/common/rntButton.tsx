import { cn } from "@/utils";
import React from "react";
import {height, minHeight} from "@mui/system";

interface RntButtonProps extends React.ComponentPropsWithoutRef<"button"> {}

export default function RntButton({ className, type, children, ...restProps }: RntButtonProps) {
  const bgColor = !className?.includes("bg-") ? "buttonGradient" : "";
  type = type ?? "button";
  const c = cn("py-1 w-56 rounded-full text-white text-lg disabled:bg-gray-500 ", bgColor, className);

  return (
    <button className={c} type={type} style={{ minHeight: "48px" }} {...restProps}>
      {children}
    </button>
  );
}
