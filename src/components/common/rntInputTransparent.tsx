import { isEmpty } from "@/utils/string";
import { forwardRef, useId } from "react";
import RntValidationError from "./RntValidationError";
import { cn } from "@/utils";

interface RntInputProps extends React.ComponentPropsWithoutRef<"input"> {
  labelClassName?: string;
  inputClassName?: string;
  validationClassName?: string;
  label?: string;
  validationError?: string;
}

const RntInputTransparent = forwardRef<HTMLInputElement, RntInputProps>(
  (
    {
      id,
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
    const reactId = useId();
    const controlId = !isEmpty(id) ? id : reactId;
    type = type ?? "text";
    const cClassName = cn("text-black w-full", className);
    const lClassName = cn("text-rnt-temp-main-text mb-1", labelClassName);
    const iClassName = cn(
      "w-full h-12 rounded-full  disabled:bg-gray-300 disabled:text-gray-600 input-inner text-white",
      inputClassName
    );

    return (
      <div className={cClassName}>
        {!isEmpty(label) && (
          <label className={lClassName} htmlFor={reactId}>
            {label}
          </label>
        )}
        <div className="border-gradient">
          <div className="input-wrapper pl-2">
            <input
              className={iClassName}
              id={controlId}
              name={id}
              type={type}
              style={{ backgroundColor: "transparent" }}
              readOnly={readOnly}
              disabled={readOnly}
              placeholder={placeholder}
              onChange={(e) => onChangeHandler != null && onChangeHandler(e)}
              onBlur={(e) => onBlurHandler != null && onBlurHandler(e)}
              value={value}
              {...rest}
              ref={ref}
            />
          </div>
        </div>
        <RntValidationError className={validationClassName} validationError={validationError} />
      </div>
    );
  }
);
RntInputTransparent.displayName = "RntInputTransparent";

export default RntInputTransparent;
