import { ChangeEvent, MouseEventHandler } from "react";
import RntInput from "./rntInput";
import RntButton from "./rntButton";

export default function RntInputWithButton({
  className,
  labelClassName,
  inputClassName,
  id,
  label,
  placeholder,
  type,
  value,
  readOnly,
  onChange: onChangeHandler,
  buttonText,
  buttonDisabled,
  onButtonClick,
}: {
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  id: string;
  type?: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  buttonText: string;
  buttonDisabled?: boolean;
  onButtonClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <div className="flex flex-row w-full gap-4">
      <RntInput
        className={className}
        labelClassName={labelClassName}
        inputClassName={inputClassName}
        id={id}
        label={label}
        placeholder={placeholder}
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChangeHandler}
      />
      <RntButton className="self-end" disabled={buttonDisabled} onClick={onButtonClick}>
        {buttonText}
      </RntButton>
    </div>
  );
}
