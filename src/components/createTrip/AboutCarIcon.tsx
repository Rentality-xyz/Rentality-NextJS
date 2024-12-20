import Image from "next/image";

export function AboutCarIcon({
  image,
  width,
  height,
  title,
  text,
}: {
  image: string;
  width?: number;
  height?: number;
  title?: string;
  text?: string | number;
}) {
  return (
    <div className="flex items-center gap-1">
      <Image className="me-1" src={image} width={width ?? 30} height={height ?? 30} alt="" />
      <div className="flex flex-col">
        {title && <p>{title}:</p>}
        <p>{text}</p>
      </div>
    </div>
  );
}
