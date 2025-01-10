import Image from "next/image";
import { cn } from "@/utils";

export function AboutCarIcon({
  className,
  image,
  width,
  height,
  title,
  text,
}: {
  className?: string;
  image: string;
  width?: number;
  height?: number;
  title?: string;
  text?: string | number;
}) {
  const cClassName = cn("flex items-center gap-1", className);
  return (
    <div className={cClassName}>
      <Image className="me-1" src={image} width={width ?? 30} height={height ?? 30} alt="" />
      <div className="flex flex-col">
        {title && <p>{title}:</p>}
        <p>{text}</p>
      </div>
    </div>
  );
}
