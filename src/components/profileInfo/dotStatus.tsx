import { memo } from "react";
import { twMerge } from "tailwind-merge";

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

function DotStatus({ color, text }: { color: `#${string}` | "success" | "error"; text: string }) {
  const dotClassName = twMerge("w-4 h-4 rounded-full inline-block pr-4", getColor(color));

  return (
    <div className="flex items-center">
      <span className={dotClassName}></span>
      <span className="ml-2">{text}</span>
    </div>
  );
}

export default memo(DotStatus);
