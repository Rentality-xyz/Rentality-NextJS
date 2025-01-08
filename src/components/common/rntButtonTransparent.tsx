import { cn } from "@/utils";

interface RntButtonTransparentProps extends React.ComponentPropsWithoutRef<"button"> {}

export default function RntButtonTransparent({
  className,
  type,
  children,
  onClick,
  disabled,
  ...props
}: RntButtonTransparentProps) {
  const bgColor = disabled ? "bg-gray-500" : "border-gradient";
  const c = cn("py-1 w-56 rounded-full text-white text-lg min-h-[48px]", bgColor, className);
  return (
    <button
      type={type === "submit" ? "submit" : undefined}
      disabled={disabled}
      {...props}
      className={c}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
