import Image from "next/image";
import logo from "../../images/logo.svg";
import Link from "next/link";
import { MouseEventHandler } from "react";

export default function NavMenuLogo({ onClick }: { onClick?: MouseEventHandler<HTMLAnchorElement> }) {
  return (
    <div className="w-40">
      <Link href={"https://rentality.xyz/"} onClick={onClick}>
        <Image alt="" width={200} height={200} src={logo} />
      </Link>
    </div>
  );
}
