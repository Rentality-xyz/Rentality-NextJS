import { cn } from "@/utils";
import imgCircleBtn from "@/images/img_circle_for_transparent_btn.svg";
import Image from "next/image";
import React from "react";

interface RntButtonTransparentProps extends React.ComponentPropsWithoutRef<"button"> {
  isVisibleCircle?: boolean;
}

export default function RntButtonTransparent({
  className,
  type,
  children,
  onClick,
  disabled,
  isVisibleCircle = true,
  ...props
}: RntButtonTransparentProps) {
  const bgColor = disabled
    ? "cursor-not-allowed text-rnt-text-button-disabled bg-rnt-button-disabled"
    : "btn_input_border-gradient";
  const c = cn(
    "transition duration-150 py-1 h-12 w-56 flex items-center justify-center rounded-full text-white text-lg",
    !disabled && "active:scale-95 active:opacity-75",
    bgColor,
    className
  );
  return (
    <button
      type={type === "submit" ? "submit" : undefined}
      disabled={disabled}
      {...props}
      className={c}
      onClick={onClick}
    >
      {children}
      <Image src={imgCircleBtn} alt="" className={`ml-4 ${disabled ? "hidden" : !isVisibleCircle && "hidden"}`} />
      <span className={`ml-4 ${!disabled ? "hidden" : !isVisibleCircle && "hidden"}`}>●</span>
    </button>
  );
}
