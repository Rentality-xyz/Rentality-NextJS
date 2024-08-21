import { cn } from "@/utils";
import { memo } from "react";

function getColor(color: `#${string}` | "success" | "error") {
  switch (color) {
    case "success":
      return "bg-[#2EB100]";
    case "error":
      return "bg-[#DB001A]";
    default:
      return `bg-[${color}]`;
  }
}

function DotStatus({
  containerClassName,
  color,
  text,
}: {
  containerClassName?: string;
  color: `#${string}` | "success" | "error";
  text: string;
}) {
  const containerClassNameMerged = cn("flex gap-2 items-center", containerClassName);
  const dotClassName = cn("w-4 h-4 rounded-full inline-block pr-4", getColor(color));

  return (
    <div className={containerClassNameMerged}>
      <span className="bg-[#2EB100] bg-[#DB001A]">{/* for tailwind initialization */}</span>
      <span className={dotClassName}></span>
      <span>{text}</span>
    </div>
  );
}

export default memo(DotStatus);
