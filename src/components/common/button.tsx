import { twMerge } from "tailwind-merge";
import { MouseEventHandler } from "react";

type Props = {
  className?: string;
  children?: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

export default function Button({ className, children, onClick, disabled, ...props }: Props) {
  const c = twMerge("h-16 w-56 rounded-md bg-violet-700 disabled:bg-gray-500", className);
  return (
    <button disabled={disabled} {...props} className={c} onClick={onClick}>
      {children}
    </button>
  );
}
