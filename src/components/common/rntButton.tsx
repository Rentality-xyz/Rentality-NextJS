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
  const c = twMerge("h-12 w-56 rounded-full bg-violet-700 disabled:bg-gray-500 text-white text-lg", className);
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
