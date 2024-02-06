import { isEmpty } from "@/utils/string";
import { ChangeEvent, FocusEvent } from "react";
import { twMerge } from "tailwind-merge";

export default function RntInputMultiline({
  className,
  labelClassName,
  inputClassName,
  validationClassName,
  id,
  label,
  placeholder,
  rows,
  value,
  readOnly,
  validationError,
  onChange: onChangeHandler,
  onBlur: onBlurHandler,
}: {
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  validationClassName?: string;
  id: string;
  rows?: number;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
  validationError?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLTextAreaElement, Element>) => void;
}) {
  const isShowLabel = label !== undefined && label?.length > 0;

  const cClassName = twMerge("text-black flex flex-col w-full", className);
  const lClassName = twMerge("text-rnt-temp-main-text whitespace-nowrap mb-1", labelClassName);
  const iClassName = twMerge(
    "w-full border-2 rounded-2xl px-4 py-2 disabled:bg-gray-300 disabled:text-gray-600",
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
      <textarea
        className={iClassName}
        rows={rows}
        id={id}
        name={id}
        readOnly={readOnly}
        disabled={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChangeHandler != null && onChangeHandler(e)}
        onBlur={(e) => onBlurHandler != null && onBlurHandler(e)}
        value={value}
      />

      {!isEmpty(validationError) ? <p className={vClassName}>* {validationError}</p> : null}
    </div>
  );
}
