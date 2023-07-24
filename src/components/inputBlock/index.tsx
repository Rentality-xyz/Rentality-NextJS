import { twMerge } from "tailwind-merge";

type Props = {
  className?: string;
  labelClassName?: string;
  textBoxClassName?: string;
  id: string;
  type?: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
  setValue?: (newValue: string) => void;
};

export default function InputBlock({
  className,
  labelClassName,
  textBoxClassName,
  id,
  label,
  placeholder,
  type,
  value,
  readOnly,
  setValue,
}: Props) {
  type = type ?? "text";
  const c = twMerge("flex flex-col w-full", className);
  const cLabel = twMerge("whitespace-nowrap mb-1", labelClassName);
  const cTextBox = twMerge("w-full h-12 border-2 rounded-md pl-4 disabled:bg-gray-300 disabled:text-gray-600", textBoxClassName);
  return (
    <div className={c}>
      {label != null ? (
        <label className={cLabel} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input
        className={cTextBox}
        id={id}
        type={type}
        readOnly={readOnly}
        disabled={readOnly}
        placeholder={placeholder}
        onChange={(e) => setValue != null && setValue(e.target.value)}
        value={value}
      />
    </div>
  );
}
