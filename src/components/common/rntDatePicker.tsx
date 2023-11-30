import { isEmpty } from "@/utils/string";
import { FocusEvent } from "react";
import { twMerge } from "tailwind-merge";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  validationClassName?: string;
  id: string;
  type?: string;
  label?: string;
  readOnly?: boolean;
  value: Date | undefined;
  validationError?: string;
  onDateChange?: (date: Date | null) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement, Element>) => void;
};

export default function RntDatePicker({
  className,
  labelClassName,
  inputClassName,
  validationClassName,
  id,
  label,
  type,
  value,
  readOnly,
  validationError,
  onDateChange,
  onBlur: onBlurHandler,
}: Props) {
  const isShowLabel = label !== undefined && label?.length > 0;

  type = type ?? "text";
  const cClassName = twMerge("text-black flex flex-col w-full", className);
  const lClassName = twMerge("text-rnt-temp-main-text whitespace-nowrap mb-1", labelClassName);
  const iClassName = twMerge(
    "w-full h-12 border-2 rounded-full pl-4 disabled:bg-gray-300 disabled:text-gray-600",
    inputClassName
  );
  const vClassName = twMerge("text-red-400 mt-2", validationClassName);

  return (
    <div className={cClassName}>
      {isShowLabel ? (
        <label className={lClassName} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <DatePicker
        className={iClassName}
        id={id}
        name={id}
        readOnly={readOnly}
        disabled={readOnly}
        selected={value}
        onChange={(date) => onDateChange != null && onDateChange(date)}
        onBlur={(e) => onBlurHandler != null && onBlurHandler(e)}
      />

      {!isEmpty(validationError) ? <p className={vClassName}>* {validationError}</p> : null}
    </div>
  );
}
