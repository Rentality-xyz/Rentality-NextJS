import { cn } from "@/utils";
import { MouseEventHandler } from "react";

interface RntCheckboxProps extends React.ComponentPropsWithoutRef<"input"> {
  label?: string;
  checkedClassName?: string;
  checkMarkClassName?: string;
  validationClassName?: string;
  validationError?: string;
}

const RntCheckbox = ({ className, label, checked, readOnly, onChange, ...rest }: RntCheckboxProps) => {
  const checkBoxBgStyle = readOnly
    ? "bg-gray-400"
    : checked
      ? "bg-rentality-primary"
      : "bg-white group-hover:bg-[#bbb]";

  return (
    <div className={className}>
      <label className="group flex cursor-pointer select-none flex-row items-center">
        <input
          className="hidden"
          type="checkbox"
          readOnly={readOnly}
          onChange={readOnly ? () => {} : onChange}
          {...rest}
        />
        <span className={`relative mr-4 h-10 w-10 shrink-0 rounded-md border-2 ${checkBoxBgStyle}`}>
          {checked ? (
            <span className="absolute right-2.5 top-1 h-6 w-3.5 shrink-0 rotate-45 border-b-4 border-r-4 border-white"></span>
          ) : null}
        </span>
        {label}
      </label>
    </div>
  );
};

export function CheckboxLight({
  className,
  checkedClassName,
  checkMarkClassName,
  label,
  checked,
  onChange,
  readOnly,
  ...rest
}: RntCheckboxProps) {
  return (
    <div className={className}>
      <label className="group flex w-fit cursor-pointer select-none flex-row items-center">
        <input
          className="hidden"
          type="checkbox"
          checked={checked}
          readOnly={readOnly}
          onChange={readOnly ? () => {} : onChange}
        />
        <span
          className={cn(
            `relative mr-4 h-6 w-6 shrink-0 rounded-md border-2`,
            readOnly ? "cursor-not-allowed border-gray-500" : "border-rnt-checkbox-border",
            checkedClassName
          )}
        >
          {checked ? (
            <span
              className={cn(
                `absolute right-[6px] top-[1px] h-3.5 w-2 shrink-0 rotate-45 border-b-2 border-r-2 border-rnt-checkbox-check-mark`,
                checkMarkClassName
              )}
            ></span>
          ) : null}
        </span>
        {label}
      </label>
    </div>
  );
}

export function CheckboxTerms({
  className,
  label,
  checked,
  onChange,
  onLabelClick,
  ...rest
}: RntCheckboxProps & {
  onLabelClick?: MouseEventHandler<HTMLLabelElement> | undefined;
}) {
  return (
    <div className={cn(className, "flex flex-row items-center")}>
      <label className="group flex w-fit cursor-pointer select-none flex-row items-center">
        <input className="hidden" type="checkbox" checked={checked} onChange={onChange} />
        <span className={`relative mr-4 h-6 w-6 shrink-0 rounded-md border-2 border-rnt-checkbox-border`}>
          {checked ? (
            <span className="absolute right-[6px] top-[1px] h-3.5 w-2 shrink-0 rotate-45 border-b-2 border-r-2 border-rnt-checkbox-check-mark"></span>
          ) : null}
        </span>
      </label>
      <span className="cursor-pointer select-none" onClick={onLabelClick}>
        {label}
      </span>
    </div>
  );
}

export default RntCheckbox;
