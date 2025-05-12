import { forwardRef, useEffect, useRef, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils";
import { extractTextFromReactNode } from "@/utils/react";
import { CheckboxLight } from "../common/rntCheckbox";
import { isEmpty } from "@/utils/string";
import Image from "next/image";
import RntValidationError from "@/components/common/RntValidationError";

interface RntDropdownMenuCheckboxContextType {
  selected: { value: string; text: string } | undefined;
  setSelected: (value: { value: string; text: string } | undefined) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const RntDropdownMenuCheckboxContext = React.createContext<RntDropdownMenuCheckboxContextType | undefined>(undefined);

interface RntDropdownMenuCheckboxProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  placeholder?: string;
  labelClassName?: string;
  label?: string;
  validationClassName?: string;
  validationError?: string;
  isTransparentStyle?: boolean;
  disabled?: boolean;
  onChange?: (selected: { value: string; text: string } | undefined) => void;
}

const RntDropdownMenuCheckboxComponent = forwardRef<HTMLDivElement, RntDropdownMenuCheckboxProps>(
  (
    {
      id,
      children,
      className,
      containerClassName,
      labelClassName,
      label,
      validationClassName,
      validationError,
      isTransparentStyle = false,
      onChange,
      disabled = false,
      placeholder,
      // value,
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
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
      onChange?.(selected);
    }, [selected]);

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
      <RntDropdownMenuCheckboxContext.Provider
        value={{ selected, setSelected, isOpen, setIsOpen, containerRef: selectRef }}
      >
        <div className={containerCn} ref={containerRef}>
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
              <span className="overflow-hidden truncate whitespace-nowrap text-center">
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
      </RntDropdownMenuCheckboxContext.Provider>
    );
  }
);

RntDropdownMenuCheckboxComponent.displayName = "RntDropdownMenuCheckbox";

function DropdownPortal({ children }: { children: React.ReactNode }) {
  const context = React.useContext(RntDropdownMenuCheckboxContext);
  if (!context) throw new Error("Dropdown must be used within a RntDropdownMenuCheckbox");

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
        minWidth: `${position.width}px`,
        maxHeight: `${dropdownHeight}px`,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

interface OptionProps {
  value: string;
  children: React.ReactNode;
  isChecked: boolean;
  onCheckedChange: (value: string) => void;
}

const Option = ({ value, children, isChecked, onCheckedChange }: OptionProps) => {
  return (
    <div
      className={cn(
        "flex w-full cursor-pointer flex-row items-center gap-2 px-4 transition-colors hover:bg-gray-600 active:bg-rentality-additional-light"
      )}
      onClick={() => onCheckedChange(value)}
    >
      <CheckboxLight className="my-0.5" label={extractTextFromReactNode(children)} checked={isChecked} />
    </div>
  );
};

Option.displayName = "RntDropdownMenuCheckbox.Option";

const RntDropdownMenuCheckbox = Object.assign(RntDropdownMenuCheckboxComponent, { Option });

export default RntDropdownMenuCheckbox;
