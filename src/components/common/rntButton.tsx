import { twMerge } from "tailwind-merge";
import { MouseEventHandler } from "react";

type Props = {
  className?: string;
  type?: string;
  children?: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

export default function RntButton({ className, type, children, onClick, disabled, ...props }: Props) {
  const bgColor = disabled ? "bg-gray-500" : "buttonGradient";
  const c = twMerge("h-12 w-56 rounded-full text-white text-lg " + bgColor, className);
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
