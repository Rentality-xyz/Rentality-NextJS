import { isEmpty } from "@/utils/string";
import { forwardRef, useId } from "react";
import RntValidationError from "./RntValidationError";
import { cn } from "@/utils";
import Image from "next/image";
import * as React from "react";
import DotStatus from "@/components/dotStatus";

export interface RntInputProps extends React.ComponentPropsWithoutRef<"input"> {
  labelClassName?: string;
  inputClassName?: string;
  validationClassName?: string;
  wrapperClassName?: string;
  label?: string;
  validationError?: string;
  validationSuccessMessage?: string;
  validationMessage?: string;
  isTransparentStyle?: boolean;
  iconFrontLabel?: string;
}

const RntInput = forwardRef<HTMLInputElement, RntInputProps>(
  (
    {
      id,
      className,
      isTransparentStyle = false,
      iconFrontLabel,
      labelClassName,
      inputClassName,
      validationClassName,
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
      ...rest
    },
    ref
  ) => {
    const reactId = useId();
    const controlId = !isEmpty(id) ? id : reactId;
    type = type ?? "text";
    const cClassName = cn("relative text-black flex flex-col w-full", className);
    const lClassName = cn("text-rnt-temp-main-text mb-1", labelClassName);
    const iClassName = cn(
      "w-full h-12 border-2 rounded-full pl-4 disabled:bg-gray-300 disabled:text-gray-600",
      inputClassName
    );

    return (
      <div className={cClassName}>
        {!isEmpty(label) &&
          (isTransparentStyle ? (
            <label className={cn("flex items-center", lClassName)} htmlFor={controlId}>
              {!isEmpty(iconFrontLabel) && (
                <Image src={iconFrontLabel!!} width={19} height={20} alt="" className="mr-2" />
              )}
              {label}
              <Image
                src={"/images/bg_input.png"}
                width={1550}
                height={90}
                alt=""
                className="absolute left-0 top-[30px] h-[62%] w-full rounded-full"
              />
            </label>
          ) : (
            <label className={lClassName} htmlFor={controlId}>
              {label}
            </label>
          ))}
        <input
          className={iClassName}
          style={isTransparentStyle ? { backgroundColor: "transparent", border: "0px", color: "white" } : {}}
          id={controlId}
          name={controlId}
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
RntInput.displayName = "RntInput";

export default RntInput;
