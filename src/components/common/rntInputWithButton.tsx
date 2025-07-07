import { ChangeEvent, MouseEventHandler } from "react";
import RntInput from "./rntInput";
import RntButton from "./rntButton";
import { cn } from "@/utils";
import RntInputTransparent from "@/components/common/rntInputTransparent";

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
    <div className="flex w-full flex-row gap-4">
      <RntInputTransparent
        className={cn(className, "flex-1")}
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
      <RntButton className="w-56 self-end" disabled={buttonDisabled} onClick={onButtonClick}>
        {buttonText}
      </RntButton>
    </div>
  );
}
