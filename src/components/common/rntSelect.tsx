import { isEmpty } from "@/utils/string";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import RntValidationError from "./rntValidationError";

interface RntSelectProps extends React.ComponentPropsWithoutRef<"select"> {
  labelClassName?: string;
  selectClassName?: string;
  label?: string;
  readOnly?: boolean;
  validationClassName?: string;
  validationError?: string;
}

const RntSelect = forwardRef<HTMLSelectElement, RntSelectProps>(
  (
    {
      children,
      className,
      labelClassName,
      selectClassName,
      validationClassName,
      validationError,
      id,
      label,
      placeholder,
      value,
      readOnly,
      onChange: onChangeHandler,
      ...rest
    },
    ref
  ) => {
    const cClassName = twMerge("text-black flex flex-col w-full", className);
    const lClassName = twMerge("text-rnt-temp-main-text whitespace-nowrap mb-1", labelClassName);
    const sclassName = twMerge("w-full h-12 border-2 rounded-full pl-4", selectClassName);

    return (
      <div className={cClassName}>
        {!isEmpty(label) && (
          <label className={lClassName} htmlFor={id}>
            {label}
          </label>
        )}
        <select
          className={sclassName}
          id={id}
          disabled={readOnly}
          placeholder={placeholder}
          onChange={(e) => onChangeHandler != null && onChangeHandler(e)}
          value={value}
          {...rest}
          ref={ref}
        >
          {children}
        </select>
        <RntValidationError className={validationClassName} validationError={validationError} />
      </div>
    );
  }
);
RntSelect.displayName = "RntSelect";

export default RntSelect;
