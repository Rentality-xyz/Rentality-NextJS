import { twMerge } from "tailwind-merge";
import { ChangeEventHandler } from "react";

interface RntCheckboxProps extends React.ComponentPropsWithoutRef<"input"> {
  label?: string;
  validationClassName?: string;
  validationError?: string;
}

const RntCheckbox = ({ className, label, checked, readOnly, onChange, ...rest }: RntCheckboxProps) => {
  const c = twMerge("", className);
  const checkBoxBgStyle = readOnly
    ? "bg-gray-400"
    : checked
      ? "bg-rentality-primary"
      : "bg-white group-hover:bg-[#bbb]";

  return (
    <div className={c}>
      <label className="group flex flex-row items-center cursor-pointer select-none">
        <input
          className="hidden"
          type="checkbox"
          readOnly={readOnly}
          onChange={readOnly ? () => {} : onChange}
          {...rest}
        />
        <span className={`relative w-10 h-10 shrink-0 mr-4 border-2 rounded-md ${checkBoxBgStyle}`}>
          {checked ? (
            <span className="absolute top-1 right-2.5 w-3.5 h-6 shrink-0 border-white border-b-4 border-r-4 rotate-45"></span>
          ) : null}
        </span>
        {label}
      </label>
    </div>
  );
};

export function CheckboxLight({ className, label, checked, onChange, ...rest }: RntCheckboxProps) {
  const c = twMerge("", className);
  return (
    <div className={c}>
      <label className="group w-fit flex flex-row items-center cursor-pointer select-none">
        <input className="hidden" type="checkbox" checked={checked} onChange={onChange} />
        <span className={`relative w-6 h-6 shrink-0 mr-4 border-2 rounded-md`}>
          {checked ? (
            <span className="absolute top-[-8px] right-0.5 w-2.5 h-6 shrink-0 border-white border-b-2 border-r-2 rotate-45"></span>
          ) : null}
        </span>
        {label}
      </label>
    </div>
  );
}

export default RntCheckbox;
