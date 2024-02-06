import { twMerge } from "tailwind-merge";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function RntInputTel({
  className,
  labelClassName,
  inputClassName,
  id,
  label,
  placeholder,
  type,
  pattern,
  value,
  readOnly,
  onChange: onChangeHandler,
}: {
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  id: string;
  type?: string;
  pattern?: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
  onChange?: (phone: string) => void;
}) {
  const isShowLabel = label !== undefined && label?.length > 0;

  type = type ?? "text";
  const cClassName = twMerge("flex flex-col w-full", className);
  const lClassName = twMerge("whitespace-nowrap mb-1", labelClassName);
  const iClassName = twMerge(
    "w-full h-12 border-2 rounded-full pl-4 disabled:bg-gray-300 disabled:text-gray-600",
    inputClassName
  );
  return (
    <div className={cClassName}>
      {isShowLabel ? (
        <label className={lClassName} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <PhoneInput
        country={"us"}
        inputClass={iClassName}
        inputProps={{
          id: { id },
          name: { id },
          placeholder: { placeholder },
        }}
        value={value}
        onChange={(phone) => onChangeHandler != null && onChangeHandler(phone)}
      />
    </div>
  );
}
