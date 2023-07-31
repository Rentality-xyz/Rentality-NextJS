import { ChangeEvent } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
  id: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
};

export default function RntSelect({
  children,
  className,
  labelClassName,
  selectClassName,
  id,
  label,
  placeholder,
  value,
  readOnly,
  onChange: onChangeHandler,
}: Props) {
  const isShowLabel = label !== undefined && label?.length > 0;

  const cClassName = twMerge("flex flex-col w-full", className);
  const lClassName = twMerge("whitespace-nowrap mb-1", labelClassName);
  const sclassName = twMerge(
    "w-full h-12 border-2 rounded-full pl-4 bg-white disabled:bg-gray-300 disabled:text-gray-600",
    selectClassName
  );

  return (
    <div className={cClassName}>
      {isShowLabel ? (
        <label className={lClassName} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <select
        className={sclassName} 
        id={id}
        disabled={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChangeHandler != null && onChangeHandler(e)}
        value={value}
      >
        {children}
      </select>
    </div>
  );
}
