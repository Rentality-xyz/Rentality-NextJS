import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import RntValidationError from "./RntValidationError";
import { cn } from "@/utils";

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
  const cClassName = cn("text-black flex flex-col w-full", className);
  const lClassName = cn("text-rnt-temp-main-text mb-1", labelClassName);
  const iClassName = cn("w-full h-12 text-white border-gradient-2 rounded-full", inputClassName);

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
        onChange={(v, d, e) => {
          const event = {
            ...e,
            target: {
              ...e?.target,
              value: v,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChangeHandler != null && onChangeHandler(event);
        }}
        onBlur={(e) => onBlurHandler != null && onBlurHandler(e)}
        value={value?.toString()}
        inputStyle={{
          background: "transparent",
          fontFamily: "'Montserrat', Arial, sans-serif",
          width: "100%",
          height: "48px",
          border: "none",
        }}
        buttonStyle={{
          background: "transparent",
          border: "none",
          borderRight: "2px solid",
          borderImage: "linear-gradient(to bottom, #74bbef 0%, #7257ce 70%, #5e3dd3 100%) 1",
        }}
        dropdownStyle={{
          borderRadius: "16px",
        }}
      />
      <RntValidationError className={validationClassName} validationError={validationError} />
    </div>
  );
}

export default RntPhoneInput;
