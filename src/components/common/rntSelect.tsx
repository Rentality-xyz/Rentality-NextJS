import { isEmpty } from "@/utils/string";
import { forwardRef } from "react";
import RntValidationError from "./RntValidationError";
import { cn } from "@/utils";
import Image, { StaticImageData } from "next/image";
import * as React from "react";

export interface RntSelectProps extends React.ComponentPropsWithoutRef<"select"> {
  labelClassName?: string;
  selectClassName?: string;
  containerClassName?: string;
  label?: string;
  readOnly?: boolean;
  placeholder?: string;
  validationClassName?: string;
  validationError?: string;
  isTransparentStyle?: boolean;
  iconFrontLabel?: StaticImageData;
}

const RntSelect = forwardRef<HTMLSelectElement, RntSelectProps>(
  (
    {
      isTransparentStyle = false,
      iconFrontLabel,
      children,
      className,
      labelClassName,
      selectClassName,
      containerClassName,
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
    const cClassName = cn("text-black flex flex-col w-full", className);
    const lClassName = cn("text-rnt-temp-main-text whitespace-nowrap mb-1", labelClassName);
    const sclassName = cn(
      "appearance-none w-full h-12 border-2 disabled:border-gray-500 rounded-full pl-4",
      selectClassName
    );
    const contClassName = cn(
      !readOnly && "btn_input_border-gradient",
      cn("select-container w-full", containerClassName)
    );
    const cTranspStyleClassName = "custom-select text-center text-rentality-secondary";
    const arrowStyle = readOnly
      ? "bg-[url('/images/icons/arrows/arrowDownDisabled.svg')]"
      : "bg-[url('/images/icons/arrows/arrowDownTurquoise.svg')]";

    return (
      <div className={cClassName}>
        {!isEmpty(label) &&
          (isTransparentStyle ? (
            <label className={cn("flex items-center", lClassName)} htmlFor={id}>
              {!isEmpty(iconFrontLabel?.src) && (
                <Image src={iconFrontLabel!!} width={24} height={24} alt="" className="mr-2" />
              )}
              {label}
            </label>
          ) : (
            <label className={lClassName} htmlFor={id}>
              {label}
            </label>
          ))}
        <div className={isTransparentStyle ? contClassName : ""}>
          <select
            className={cn(isTransparentStyle && cTranspStyleClassName, sclassName)}
            id={id}
            style={isTransparentStyle ? { backgroundColor: "transparent", paddingLeft: "0px" } : {}}
            disabled={readOnly}
            placeholder={placeholder}
            onChange={(e) => onChangeHandler != null && onChangeHandler(e)}
            value={value}
            {...rest}
            ref={ref}
          >
            {children}
          </select>
          {isTransparentStyle && <span className={`custom-arrow top-[70%] ${arrowStyle}`}></span>}
          <RntValidationError className={validationClassName} validationError={validationError} />
        </div>
      </div>
    );
  }
);
RntSelect.displayName = "RntSelect";

export default RntSelect;
