"use client";

import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  notifyChange: (v: string) => void;
}

const RntFilterSelectContext = React.createContext<RntFilterSelectContextType | undefined>(undefined);

interface RntFilterSelectProps extends Omit<React.ComponentPropsWithoutRef<"select">, "multiple"> {
  containerClassName?: string;
  labelClassName?: string;
  label?: string;
  validationClassName?: string;
  validationError?: string;
  isTransparentStyle?: boolean;
  value?: string | number | ReadonlyArray<string> | undefined;
  defaultValue?: string | number | ReadonlyArray<string> | undefined;
}

function deriveSelected(value: string | number | ReadonlyArray<string> | undefined, children: React.ReactNode): { value: string; text: string } | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const v = Array.isArray(value) ? value[0] : value;
  const s = String(v);
  let found: { value: string; text: string } | undefined;
  React.Children.forEach(children, (child) => {
    if (found || !React.isValidElement(child)) return;
    if (String((child as any).props.value) === s) {
      found = { value: s, text: extractTextFromReactNode((child as any).props.children) };
    }
  });
  return found ?? { value: s, text: s };
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
      onChange,
      value,
      defaultValue,
      ...rest
    },
    ref
  ) => {
    const containerCn = cn("relative flex flex-col text-black", containerClassName);
    const labelCn = cn("text-rnt-temp-main-text whitespace-nowrap mb-1 pl-4", labelClassName);
    const selectCn = cn(
      `relative flex flex-row h-12 w-full cursor-pointer items-center justify-center rounded-full px-4`,
      className,
      !disabled ? "active:scale-95 active:opacity-75 text-white" : "border-2 border-gray-500 text-gray-500 cursor-not-allowed",
      isTransparentStyle ? "bg-transparent" : "bg-rnt-button-gradient",
      !isTransparentStyle && disabled && "bg-transparent",
      isTransparentStyle && !disabled && "btn_input_border-gradient"
    );

    const selectRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const controlled = value !== undefined;
    const initialSelected = useMemo(
      () => deriveSelected(controlled ? value : defaultValue, children),
      []
    );

    const [selected, setSelected] = useState<{ value: string; text: string } | undefined>(initialSelected);
    const [isOpen, setIsOpen] = useState(false);

    useLayoutEffect(() => {
      if (controlled) {
        const d = deriveSelected(value, children);
        setSelected(d);
      }
    }, [controlled, value, children]);

    useEffect(() => {
      if ((controlled ? value : selected?.value) !== "") setIsOpen(false);
    }, [value, selected?.value, controlled]);

    const notifyChange = (v: string) => {
      if (!onChange) return;
      onChange({ target: { value: v } } as unknown as React.ChangeEvent<HTMLSelectElement>);
    };

    const toggleDropdown = () => {
      if (!disabled) setIsOpen((p) => !p);
    };

    return (
      <RntFilterSelectContext.Provider value={{ selected, setSelected, isOpen, setIsOpen, containerRef: selectRef, notifyChange }}>
        <div className={containerCn} ref={containerRef}>
          <select
            hidden
            value={selected?.value ?? ""}
            id={id}
            aria-hidden="true"
            tabIndex={-1}
            {...rest}
          >
            {React.Children.map(children, (child) =>
              React.isValidElement(child) ? (
                <option value={String((child as any).props.value)} key={(child as any).key ?? String((child as any).props.value)}>
                  {(child as any).props.children}
                </option>
              ) : null
            )}
          </select>

          {!isEmpty(label) && (
            <label className={labelCn} htmlFor={id}>
              {label}
            </label>
          )}

          <div ref={selectRef}>
            <div className={selectCn} id={id} ref={ref} onClick={toggleDropdown} role="button" aria-haspopup="listbox" aria-expanded={isOpen}>
              {selected?.text || placeholder}
              <Image
                src={
                  disabled
                    ? "/images/icons/arrows/arrowTriangleDownGray.svg"
                    : isTransparentStyle
                      ? "/images/icons/arrows/arrowTriangleDownGradient.svg"
                      : "/images/icons/arrows/arrowTriangleDownWhite.svg"
                }
                width={12}
                height={9}
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

  const [position, setPosition] = useState<{ top: number; left: number; width: number; realTop: number }>();

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      realTop: rect.bottom
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
        maxHeight: `${dropdownHeight}px`
      }}
    >
      {children}
    </div>,
    document.body
  );
}

interface OptionProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string | number;
}

const Option = forwardRef<HTMLDivElement, OptionProps>(({ value, children, className, ...rest }, ref) => {
  const context = React.useContext(RntFilterSelectContext);
  if (!context) throw new Error("RntFilterSelect.Option must be used within a RntFilterSelect");
  const { selected, setSelected, setIsOpen, notifyChange } = context;
  const sVal = String(value);
  const isSelected = selected?.value === sVal;

  return (
    <div
      ref={ref}
      className={cn(
        className,
        "flex w-full cursor-pointer flex-row items-center gap-2 px-4 transition-colors hover:bg-gray-600 active:bg-rentality-additional-light"
      )}
      onClick={() => {
        const text = extractTextFromReactNode(children);
        setSelected({ value: sVal, text });
        notifyChange(sVal);
        setIsOpen(false);
      }}
      role="option"
      aria-selected={isSelected}
      data-value={sVal}
      {...rest}
    >
      <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-rentality-additional-tint bg-transparent transition-all">
        {isSelected && <div className="h-2 w-2 rounded-full bg-rentality-additional-tint" />}
      </div>
      <span>{children}</span>
    </div>
  );
});

Option.displayName = "FilterSelect.Option";

const RntFilterSelect = Object.assign(RntFilterSelectComponent, { Option });

export default RntFilterSelect;
