import { isEmpty } from "@/utils/string";
import { forwardRef, useId } from "react";
import RntValidationError from "./RntValidationError";
import { cn } from "@/utils";
import { StaticImageData } from "next/image";
import { RntInputProps } from "@/components/common/rntInput";
import DotStatus from "@/components/dotStatus";
import * as React from "react";

const RntInputTransparent = forwardRef<HTMLInputElement, RntInputProps>(
  (
    {
      id,
      className,
      labelClassName,
      inputClassName,
      validationClassName,
      wrapperClassName,
      label,
      placeholder,
      type,
      value,
      readOnly,
      validationError,
      validationSuccessMessage,
      validationMessage,
      onChange: onChangeHandler,
      onBlur: onBlurHandler,
      style,
      ...rest
    },
    ref
  ) => {
    const reactId = useId();
    const controlId = !isEmpty(id) ? id : reactId;
    type = type ?? "text";
    const cClassName = cn("text-black w-full", className);
    const lClassName = cn("text-rnt-temp-main-text mb-1 pl-4", labelClassName);
    const iClassName = cn(
      "w-full h-12 rounded-full disabled:text-gray-400 disabled:cursor-not-allowed input-inner text-white",
      inputClassName
    );

    return (
      <div className={cClassName}>
        {!isEmpty(label) && (
          <label className={lClassName} htmlFor={reactId}>
            {label}
          </label>
        )}
        <div
          className={cn(
            `rounded-full ${readOnly ? "border-2 border-gray-500" : "btn_input_border-gradient"} ${!isEmpty(label) && "mt-1"}`,
            wrapperClassName
          )}
        >
          <div className="input-wrapper pl-2">
            <input
              autoComplete="off"
              className={iClassName}
              id={controlId}
              name={id}
              type={type}
              style={{
                backgroundColor: "transparent",
                ...style,
              }}
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
        {validationSuccessMessage && (
          <DotStatus
            containerClassName="text-sm text-rnt-temp-main-text mt-2 pl-4 break-words xl:whitespace-nowrap"
            color="success"
            text={validationSuccessMessage}
          />
        )}
        {validationMessage && (
          <DotStatus
            containerClassName="text-sm text-rnt-temp-main-text mt-2 pl-4 break-words xl:whitespace-nowrap"
            color="warning"
            text={validationMessage}
          />
        )}
      </div>
    );
  }
);
RntInputTransparent.displayName = "RntInputTransparent";

export default RntInputTransparent;
