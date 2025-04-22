import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/utils";
import * as React from "react";
import { createPortal } from "react-dom";
import RntValidationError from "./RntValidationError";
import { isEmpty } from "@/utils/string";
import Image from "next/image";
import { extractTextFromReactNode } from "@/utils/react";

interface RntFilterSelectContextType {
  selected: { value: string; text: string } | undefined;
  setSelected: (value: { value: string; text: string } | undefined) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const RntFilterSelectContext = React.createContext<RntFilterSelectContextType | undefined>(undefined);

interface RntFilterSelectProps extends React.ComponentPropsWithoutRef<"select"> {
  containerClassName?: string;
  labelClassName?: string;
  label?: string;
  validationClassName?: string;
  validationError?: string;
  isTransparentStyle?: boolean;
}

const RntFilterSelectComponent = forwardRef<HTMLDivElement, RntFilterSelectProps>(
  (
    {
      children,
      className,
      containerClassName,
      labelClassName,
      label,
      validationClassName,
      validationError,
      isTransparentStyle = false,
      disabled,
      id,
      placeholder,
      value,
      ...rest
    },
    ref
  ) => {
    const containerCn = cn("relative flex flex-col text-black", containerClassName);
    const labelCn = cn("text-rnt-temp-main-text whitespace-nowrap mb-1 pl-4", labelClassName);
    const selectCn = cn(
      `relative flex flex-row h-12 w-full cursor-pointer items-center justify-center rounded-full px-4`,
      className,
      !disabled
        ? "active:scale-95 active:opacity-75 text-white"
        : "border-2 border-gray-500 text-gray-500 cursor-not-allowed",
      isTransparentStyle ? "bg-transparent" : "bg-rnt-button-gradient",
      !isTransparentStyle && disabled && "bg-transparent",
      isTransparentStyle && !disabled && "btn_input_border-gradient"
    );
    const [selected, setSelected] = useState<{ value: string; text: string } | undefined>(undefined);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement>(null);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (value !== "") {
        setIsOpen(false);
      }
    }, [value]);

    useEffect(() => {
      if (value === undefined) {
        setSelected(undefined);
        return;
      }

      if (typeof value === "string" || (typeof value === "number" && !isNaN(value))) {
        let isFound = false;

        React.Children.forEach(children, (child) => {
          if (!isFound && React.isValidElement(child) && child.props.value === value?.toString()) {
            setSelected({
              value: child.props.value,
              text: extractTextFromReactNode(child.props.children),
            });
            isFound = true;
          }
        });

        if (!isFound) {
          setSelected({
            value: value.toString(),
            text: value.toString(),
          });
        }
      }
    }, [value, children]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
      if (!disabled) {
        setIsOpen((prev) => !prev);
      }
    };

    useEffect(() => {
      if (!hiddenSelectRef.current) return;
      hiddenSelectRef.current.value = selected?.value ?? "";
      hiddenSelectRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }, [selected?.value]);

    return (
      <RntFilterSelectContext.Provider value={{ selected, setSelected, isOpen, setIsOpen, containerRef: selectRef }}>
        <div className={containerCn} ref={containerRef}>
          {/* hidden select element */}
          <select value={selected?.value ?? ""} ref={hiddenSelectRef} hidden {...rest}>
            {React.Children.map(children, (child) =>
              React.isValidElement(child) ? <option value={child.props.value}>{child.props.children}</option> : null
            )}
          </select>

          {!isEmpty(label) && (
            <label className={labelCn} htmlFor={id}>
              {label}
            </label>
          )}
          <div ref={selectRef}>
            <div className={selectCn} id={id} ref={ref} onClick={toggleDropdown}>
              <span className="flex-1 overflow-hidden truncate whitespace-nowrap text-center">
                {selected?.text || placeholder}
              </span>
              <Image
                src={
                  disabled
                    ? "/images/icons/arrows/arrowTriangleDownGray.svg"
                    : isTransparentStyle
                      ? "/images/icons/arrows/arrowTriangleDownGradient.svg"
                      : "/images/icons/arrows/arrowTriangleDownWhite.svg"
                }
                width="12"
                height="9"
                alt=""
                className={`ml-4 transition ${isOpen ? "rotate-180" : "rotate-0"} `}
              />
            </div>
          </div>
          {isOpen && <DropdownPortal>{children}</DropdownPortal>}
          <RntValidationError className={validationClassName} validationError={validationError} />
        </div>
      </RntFilterSelectContext.Provider>
    );
  }
);

RntFilterSelectComponent.displayName = "RntFilterSelect";

function DropdownPortal({ children }: { children?: React.ReactNode }) {
  const context = React.useContext(RntFilterSelectContext);
  if (!context) throw new Error("Dropdown must be used within a RntFilterSelect");

  const { containerRef } = context;
  const [position, setPosition] = useState<{ top: number; left: number; width: number; realTop: number } | undefined>(
    undefined
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      realTop: rect.bottom,
    });
  }, [containerRef]);

  if (!position) return null;

  const minDropdownHeight = 400;
  const viewportHeight = window.innerHeight;
  const availableSpaceBelow = viewportHeight - (position.realTop + 8);
  const dropdownHeight = Math.max(availableSpaceBelow, minDropdownHeight) - 8;

  return createPortal(
    <div
      className="custom-scroll absolute z-10 overflow-y-auto rounded-lg border border-gray-500 bg-rentality-bg-left-sidebar px-0 py-2 shadow-md"
      style={{
        top: `${position.top + 8}px`,
        left: `${position.left}px`,
        // width: `${position.width}px`,
        minWidth: `${position.width}px`,
        maxHeight: `${dropdownHeight}px`,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

interface OptionProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
}

const Option = forwardRef<HTMLDivElement, OptionProps>(({ value, children, className, ...rest }, ref) => {
  const context = React.useContext(RntFilterSelectContext);
  if (!context) throw new Error("RntFilterSelect.Option must be used within a RntFilterSelect");

  const { selected, setSelected, setIsOpen } = context;
  const isSelected = selected?.value === value;

  return (
    <div
      ref={ref}
      className={cn(
        className,
        "flex w-full cursor-pointer flex-row items-center gap-2 rounded-md px-4 transition-colors hover:bg-gray-600 active:bg-rentality-additional-light"
      )}
      onClick={() => {
        setSelected({ value, text: extractTextFromReactNode(children) });
        setIsOpen(false);
      }}
      role="button"
      {...rest}
    >
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 border-rentality-additional-tint bg-transparent transition-all`}
      >
        {isSelected && <div className="h-2 w-2 rounded-full bg-rentality-additional-tint"></div>}
      </div>
      <span>{children}</span>
    </div>
  );
});

Option.displayName = "FilterSelect.Option";
const RntFilterSelect = Object.assign(RntFilterSelectComponent, { Option: Option });

export default RntFilterSelect;
