import { twMerge } from "tailwind-merge";
import Button from "../common/button";
import { ChangeEventHandler, MouseEventHandler } from "react";

type Props<T> = {
  className?: string;
  id: string;
  type?: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  value: T;
  onValueChange?: ChangeEventHandler<HTMLInputElement>;
  buttonText: string;
  buttonDisabled?: boolean;
  onButtonClick: MouseEventHandler<HTMLButtonElement>;
};

export default function InputBlockWithButton<T extends string | number | readonly string[] | undefined>({
  className,
  id,
  label,
  placeholder,
  type,
  value,
  readOnly,
  onValueChange,
  buttonText,
  buttonDisabled,
  onButtonClick
}: Props<T>) {
  type = type ?? "text";
  const c = twMerge("flex flex-col w-full", className);
  return (
    <div className={c}>
      {label != null ? (
        <label className="whitespace-nowrap mb-1" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className="flex flex-row gap-4">
        <input
          className="w-full h-12 border-2 rounded-md pl-4"
          id={id}
          type={type}
          readOnly={readOnly}
          disabled={readOnly}
          placeholder={placeholder}
          onChange={onValueChange}
          value={value}
        />
        <Button className="h-12" disabled={buttonDisabled} onClick={onButtonClick}>{buttonText}</Button>
      </div>
    </div>
  );
}
