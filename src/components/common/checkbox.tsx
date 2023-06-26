import Head from "next/head";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { ChangeEventHandler, MouseEventHandler } from "react";

type Props = {
  className?: string;
  title: string;
  value: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export default function Checkbox({
  className,
  title,
  value,
  onChange,
  ...props
}: Props) {
  const c = twMerge(
    "",
    className
  );
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
