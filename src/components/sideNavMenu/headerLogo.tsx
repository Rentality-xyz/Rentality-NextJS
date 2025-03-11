import Image from "next/image";
import Link from "next/link";
import { MouseEventHandler } from "react";

export default function HeaderLogo({ onClick }: { onClick?: MouseEventHandler<HTMLAnchorElement> }) {
  return (
    <div className="w-40 max-lg:hidden">
      <Link href={"https://rentality.io/"} onClick={onClick}>
        <Image alt="" width={150} height={40} src={"/logo_rentality.svg"} />
      </Link>
    </div>
  );
}
