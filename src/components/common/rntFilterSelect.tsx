import { isEmpty } from "@/utils/string";
import { forwardRef, useEffect, useRef, useState } from "react";
import RntValidationError from "./RntValidationError";
import { cn } from "@/utils";
import Image, { StaticImageData } from "next/image";
import * as React from "react";
import { createPortal } from "react-dom";
import arrowDown from "@/images/arrows/arrowDownDisabled.svg"
import RntButtonTransparent from "@/components/common/rntButtonTransparent";

export interface RntFilterSelectProps extends React.ComponentPropsWithoutRef<"div"> {
  labelClassName?: string;
  selectClassName?: string;
  containerClassName?: string;
  label?: string;
  readOnly?: boolean;
  validationClassName?: string;
  validationError?: string;
  isTransparentStyle?: boolean;
  value:String;
  iconFrontLabel?: StaticImageData;
}

const RntFilterSelect = forwardRef<HTMLDivElement, RntFilterSelectProps>(
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
    const sclassName = cn("w-full h-12 border-2 disabled:border-gray-500 rounded-full pl-4 bg-white border-gray-500", selectClassName);
    const contClassName = cn(!readOnly && "border-gradient", cn("select-container w-full", containerClassName));
    const cTranspStyleClassName = "custom-select text-center text-rentality-secondary";
    const arrowStyle = readOnly
      ? "bg-[url('../images/arrows/arrowDownDisabled.svg')]"
      : "bg-[url('../images/arrows/arrowDownTurquoise.svg')]";

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [positionDropdown, setPositionDropdown] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPositionDropdown({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
    }, [isOpen]);

    useEffect(() => {
      if (value !== "") {
        setIsOpen(false);
      }
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener("click", handleClickOutside);

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, []);

    const toggleDropdown = () => {
      if(!readOnly) {
        setIsOpen((prevIsOpen) => {
          return !prevIsOpen;
        });
      }
    };

    return (
      <div className={cClassName} ref={buttonRef}>
        <button className={!readOnly ? "active:scale-95 active:opacity-75" :""}>
          {!isEmpty(label) &&
            (isTransparentStyle ? (
              <label className={cn("flex items-center", lClassName)} htmlFor={id}>
                {!isEmpty(iconFrontLabel?.src) && <Image src={iconFrontLabel!!} alt="" className="mr-2" />}
                {label}
              </label>
            ) : (
              <label className={lClassName} htmlFor={id}>
                {label}
              </label>
            ))}
          <div className={isTransparentStyle ? contClassName : ""} ref={dropdownRef}>
            <div
              className={cn(isTransparentStyle && cTranspStyleClassName, sclassName)}
              id={id}
              style={isTransparentStyle ? { backgroundColor: "transparent", border: "0px", paddingLeft: "0px" } : {}}
              ref={ref}
              onClick={toggleDropdown}
              {...rest}
            >
              <div className="flex h-full w-full items-center justify-center">
                <div className="whitespace">{value || placeholder}</div>
              </div>
            </div>
            {isOpen &&
              createPortal(
                <div
                  className="border-gray-500 absolute z-10 overflow-y-auto rounded-lg border bg-rentality-bg-left-sidebar px-0 py-2 shadow-md"
                  style={{
                    top: `${positionDropdown.top + 8}px`,
                    left: `${positionDropdown.left}px`,
                    maxHeight: `calc(100vh - ${positionDropdown.top + 8}px)`,
                  }}
                >
                  {children}
                </div>,
                document.body
              )}

            {isTransparentStyle && <span className={`custom-arrow top-[70%] ${arrowStyle}`}></span>}
            <RntValidationError className={validationClassName} validationError={validationError} />
          </div>
        </button>
      </div>
    );
  }
);
RntFilterSelect.displayName = "RntFilterSelect";

export default RntFilterSelect;