import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { twMerge } from "tailwind-merge";
import RntValidationError from "./RntValidationError";

interface RntPhoneInputProps extends React.ComponentPropsWithoutRef<"input"> {
  labelClassName?: string;
  inputClassName?: string;
  validationClassName?: string;
  label?: string;
  validationError?: string;
}

function RntPhoneInput({
  className,
  labelClassName,
  inputClassName,
  validationClassName,
  id,
  label,
  placeholder,
  value,
  readOnly,
  validationError,
  onChange: onChangeHandler,
  onBlur: onBlurHandler,
}: RntPhoneInputProps) {
  const isShowLabel = label !== undefined && label?.length > 0;
  const cClassName = twMerge("text-black flex flex-col w-full", className);
  const lClassName = twMerge("text-rnt-temp-main-text mb-1", labelClassName);
  const iClassName = twMerge("w-full h-12 disabled:bg-gray-300 disabled:text-gray-600", inputClassName);

  return (
    <div className={cClassName}>
      {isShowLabel ? (
        <label className={lClassName} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <PhoneInput
        containerClass={iClassName}
        inputProps={{
          id: id,
          name: id,
        }}
        disabled={readOnly}
        placeholder={placeholder}
        country={"us"}
        onChange={(v, d, e) => onChangeHandler != null && onChangeHandler(e)}
        onBlur={(e) => onBlurHandler != null && onBlurHandler(e)}
        value={value?.toString()}
        inputStyle={{
          fontFamily: "'Montserrat', Arial, sans-serif",
          width: "100%",
          height: "48px",
          borderRadius: "9999px",
        }}
      />

      <RntValidationError className={validationClassName} validationError={validationError} />
    </div>
  );
}

export default RntPhoneInput;
