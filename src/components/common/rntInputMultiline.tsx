import { isEmpty } from "@/utils/string";
import { forwardRef } from "react";
import RntValidationError from "./RntValidationError";
import { cn } from "@/utils";

interface RntInputMultilineProps extends React.ComponentPropsWithoutRef<"textarea"> {
  labelClassName?: string;
  inputClassName?: string;
  validationClassName?: string;
  label?: string;
  validationError?: string;
  isTransparentStyle?: boolean;
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
      isTransparentStyle = false,
      onChange: onChangeHandler,
      onBlur: onBlurHandler,
      ...rest
    },
    ref
  ) => {
    const cClassName = cn("text-black flex flex-col w-full", className);
    const lClassName = cn("text-rnt-temp-main-text whitespace-nowrap mb-1 pl-4", labelClassName);
    const iClassName = cn(
      "w-full border-0 rounded-2xl px-4 py-2",
      inputClassName,
      isTransparentStyle && "bg-transparent focus:outline-none focus:ring-0 text-white disabled:text-gray-400",
      readOnly && "bg-transparent"
    );

    return (
      <div className={cClassName}>
        {!isEmpty(label) && (
          <label className={lClassName} htmlFor={id}>
            {label}
          </label>
        )}
        <div
          className={cn(
            `${!isEmpty(label) && "mt-1"}`,
            readOnly && "rounded-2xl border-2 border-gray-500 bg-transparent",
            isTransparentStyle && !readOnly && "textarea_border-gradient"
          )}
          style={isTransparentStyle ? { borderRadius: "16px" } : {}}
        >
          <div className="input-wrapper pl-2">
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
          </div>
        </div>
        <RntValidationError className={validationClassName} validationError={validationError} />
      </div>
    );
  }
);
RntInputMultiline.displayName = "RntInputMultiline";

export default RntInputMultiline;
