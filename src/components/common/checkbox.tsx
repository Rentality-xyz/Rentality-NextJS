import { twMerge } from "tailwind-merge";
import { ChangeEventHandler } from "react";

export default function Checkbox({
  className,
  title,
  value,
  onChange,
  ...props
}: {
  className?: string;
  title: string;
  value: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  const c = twMerge("", className);
  const checkBoxBgStyle = value ? "bg-rentality-primary" : "bg-white group-hover:bg-[#bbb]";
  return (
    <div className={c}>
      <label className="group flex flex-row items-center cursor-pointer select-none">
        <input className="hidden" type="checkbox" value={value ? 1 : 0} onChange={onChange} />
        <span className={`relative w-10 h-10 shrink-0 mr-4 border-2 rounded-md ${checkBoxBgStyle}`}>
          {value ? (
            <span className="absolute top-1 right-2.5 w-3.5 h-6 shrink-0 border-white border-b-4 border-r-4 rotate-45"></span>
          ) : null}
        </span>
        {title}
      </label>
    </div>
  );
}

export function CheckboxOld({ className, title, value, onChange, ...props }: Props) {
  const c = twMerge("", className);
  return (
    <div className={c}>
      <label className="rentality-checkbox">
        {title}
        <input type="checkbox" value={value ? 1 : 0} onChange={onChange} />
        <span className="rentality-checkmark border-2 rounded-md"></span>
      </label>
    </div>
  );
}
