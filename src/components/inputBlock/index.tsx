import { twMerge } from "tailwind-merge";

type Props = {
  className?: string;
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
  return (
    <div className={c}>
      {label != null ? (
        <label className="whitespace-nowrap mb-1" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input
        className="w-full h-12 border-2 rounded-md pl-4"
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
