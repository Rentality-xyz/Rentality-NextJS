import { twMerge } from "tailwind-merge";

type Props = {
  children?: React.ReactNode;
  className?: string;
  id: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
  setValue?: (newValue: string) => void;
};

export default function SelectBlock({
  children,
  className,
  id,
  label,
  placeholder,
  value,
  readOnly,
  setValue,
}: Props) {
  const c = twMerge("flex flex-col w-full", className);
  return (
    <div className={c}>
      {label != null ? (
        <label className="whitespace-nowrap mb-1" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <select
        className="w-full h-12 border-2 rounded-md pl-4 bg-white disabled:bg-gray-300 disabled:text-gray-600"
        id={id}
        disabled={readOnly}
        placeholder={placeholder}
        onChange={(e) => setValue != null && setValue(e.target.value)}
        value={value}
      >
        {children}
      </select>
    </div>
  );
}
