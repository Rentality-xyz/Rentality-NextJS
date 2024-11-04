import { isEmpty } from "@/utils/string";
import { forwardRef, useId } from "react";
import RntValidationError from "./RntValidationError";
import { cn } from "@/utils";
import Image, { StaticImageData } from "next/image";
import icLocation from "@/images/ic_location.png";
import bgBlockSearch from "@/images/bg_block_search.png";
import * as React from "react";

interface RntInputProps extends React.ComponentPropsWithoutRef<"input"> {
  labelClassName?: string;
  inputClassName?: string;
  validationClassName?: string;
  label?: string;
  validationError?: string;
  isTransparentStyle?: boolean;
  iconFrontLabel?: StaticImageData;
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
            <label className={cn("flex items-center", lClassName)} htmlFor={reactId}>
              {!isEmpty(iconFrontLabel?.src) && <Image src={iconFrontLabel!!} alt="" className="mr-2" />}
              {label}
              <Image src={bgBlockSearch} alt="" className="absolute left-0 top-[30px] h-[62%] w-full rounded-full" />
            </label>
          ) : (
            <label className={lClassName} htmlFor={id}>
              {label}
            </label>
          ))}
        <input
          className={iClassName}
          style={isTransparentStyle ? { backgroundColor: "transparent", border: "0px", color: "white" } : {}}
          id={reactId}
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
        <RntValidationError className={validationClassName} validationError={validationError} />
      </div>
    );
  }
);
RntInput.displayName = "RntInput";

export default RntInput;
