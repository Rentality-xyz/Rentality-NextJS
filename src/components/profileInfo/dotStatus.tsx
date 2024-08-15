import { getDotStatusColor } from "@/utils/tailwind";
import { memo } from "react";
import { twMerge } from "tailwind-merge";

function DotStatus({
  containerClassName,
  color,
  text,
}: {
  containerClassName?: string;
  color: `#${string}` | "success" | "error";
  text: string;
}) {
  const containerClassNameMerged = twMerge("flex gap-2 items-center", containerClassName);
  const dotClassName = twMerge("w-4 h-4 rounded-full inline-block pr-4", getDotStatusColor(color));

  return (
    <div className={containerClassNameMerged}>
      <span className={dotClassName}></span>
      <span>{text}</span>
    </div>
  );
}

export default memo(DotStatus);
