import { isEmpty } from "@/utils/string";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import RntValidationError from "./rntValidationError";

interface RntInputMultilineProps extends React.ComponentPropsWithoutRef<"textarea"> {
  labelClassName?: string;
  inputClassName?: string;
  validationClassName?: string;
  label?: string;
  validationError?: string;
}

const RntInputMultiline = forwardRef<HTMLTextAreaElement, RntInputMultilineProps>(
  (
    {
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
      ...rest
    },
    ref
  ) => {
    const cClassName = twMerge("text-black flex flex-col w-full", className);
    const lClassName = twMerge("text-rnt-temp-main-text whitespace-nowrap mb-1", labelClassName);
    const iClassName = twMerge(
      "w-full border-2 rounded-2xl px-4 py-2 disabled:bg-gray-300 disabled:text-gray-600",
      inputClassName
    );

    return (
      <div className={cClassName}>
        {!isEmpty(label) && (
          <label className={lClassName} htmlFor={id}>
            {label}
          </label>
        )}
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
          {...rest}
          ref={ref}
        />

        <RntValidationError className={validationClassName} validationError={validationError} />
      </div>
    );
  }
);
RntInputMultiline.displayName = "RntInputMultiline";

export default RntInputMultiline;
