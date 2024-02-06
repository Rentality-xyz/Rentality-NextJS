import { twMerge } from "tailwind-merge";

interface RntSelectProps extends React.ComponentPropsWithoutRef<"select"> {
  labelClassName?: string;
  selectClassName?: string;
  label?: string;
  readOnly?: boolean;
}

export default function RntSelect({
  children,
  className,
  labelClassName,
  selectClassName,
  id,
  label,
  placeholder,
  value,
  readOnly,
  onChange: onChangeHandler,
}: RntSelectProps) {
  const isShowLabel = label !== undefined && label?.length > 0;

  const cClassName = twMerge("text-black flex flex-col w-full", className);
  const lClassName = twMerge("text-rnt-temp-main-text whitespace-nowrap mb-1", labelClassName);
  const sclassName = twMerge("w-full h-12 border-2 rounded-full pl-4", selectClassName);

  return (
    <div className={cClassName}>
      {isShowLabel ? (
        <label className={lClassName} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <select
        className={sclassName}
        id={id}
        disabled={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChangeHandler != null && onChangeHandler(e)}
        value={value}
      >
        {children}
      </select>
    </div>
  );
}
