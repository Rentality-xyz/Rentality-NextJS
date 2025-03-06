import { cn } from "@/utils";
import React, { ChangeEventHandler } from "react";

export default function RntFileButton({
  className,
  id,
  children,
  onChange: onFileChange,
  disabled,
  accept,
  ...props
}: {
  className?: string;
  id?: string;
  children?: React.ReactNode;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  accept?: string;
}) {
  const bgColor = !className?.includes("bg-") ? "bg-rnt-button-gradient" : "";
  const c = cn(
    "h-12 w-56 active:scale-95 active:opacity-75 rounded-full text-white text-lg flex justify-center items-center disabled:bg-gray-500 cursor-pointer",
    bgColor,
    className
  );

  return (
    <label {...props} className={c}>
      <input
        disabled={disabled}
        className="hidden"
        type="file"
        id={id}
        name={id}
        onChange={onFileChange}
        accept={accept}
      />
      {children}
      <span className={`ml-4`}>●</span>
    </label>
  );
}
