import { twMerge } from "tailwind-merge";
import { MouseEventHandler } from "react";

type Props = {
  className?: string;
  type?: string;
  children?: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

export default function RntButtonTransparent({ className, type, children, onClick, disabled, ...props }: Props) {
  const bgColor = disabled ? "bg-gray-500" : "border-gradient";
  const c = twMerge("h-12 w-56 text-white text-lg " + bgColor, className);
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
