interface RntCheckboxProps extends React.ComponentPropsWithoutRef<"input"> {
  label?: string;
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

export function CheckboxLight({ className, label, checked, onChange, ...rest }: RntCheckboxProps) {
  return (
    <div className={className}>
      <label className="group flex w-fit cursor-pointer select-none flex-row items-center">
        <input className="hidden" type="checkbox" checked={checked} onChange={onChange} />
        <span className={`relative mr-4 h-6 w-6 shrink-0 rounded-md border-2`}>
          {checked ? (
            <span className="absolute right-0.5 top-[-8px] h-6 w-2.5 shrink-0 rotate-45 border-b-2 border-r-2 border-white"></span>
          ) : null}
        </span>
        {label}
      </label>
    </div>
  );
}

export default RntCheckbox;
