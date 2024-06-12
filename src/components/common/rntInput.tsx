import { isEmpty } from "@/utils/string";
import { forwardRef, useId } from "react";
import { twMerge } from "tailwind-merge";

interface RntInputProps extends React.ComponentPropsWithoutRef<"input"> {
  labelClassName?: string;
  inputClassName?: string;
  validationClassName?: string;
  label?: string;
  validationError?: string;
}

const RntInput = forwardRef<HTMLInputElement, RntInputProps>(
  (
    {
      className,
      labelClassName,
      inputClassName,
      validationClassName,
      label,
      placeholder,
      type,
      value,
      readOnly,
      validationError,
      onChange: onChangeHandler,
      onBlur: onBlurHandler,
      ...rest
    },
    ref
  ) => {
    const id = useId();
    type = type ?? "text";
    const cClassName = twMerge("text-black flex flex-col w-full", className);
    const lClassName = twMerge("text-rnt-temp-main-text mb-1", labelClassName);
    const iClassName = twMerge(
      "w-full h-12 border-2 rounded-full pl-4 disabled:bg-gray-300 disabled:text-gray-600",
      inputClassName
    );
    const vClassName = twMerge("text-red-400 mt-2", validationClassName);

    return (
      <div className={cClassName}>
        {!isEmpty(label) && (
          <label className={lClassName} htmlFor={id}>
            {label}
          </label>
        )}
        <input
          className={iClassName}
          id={id}
          name={id}
          type={type}
          readOnly={readOnly}
          disabled={readOnly}
          placeholder={placeholder}
          onChange={(e) => onChangeHandler != null && onChangeHandler(e)}
          onBlur={(e) => onBlurHandler != null && onBlurHandler(e)}
          value={value}
          {...rest}
          ref={ref}
        />

        {!isEmpty(validationError) && <p className={vClassName}>* {validationError}</p>}
      </div>
    );
  }
);
RntInput.displayName = "RntInput";

export default RntInput;
