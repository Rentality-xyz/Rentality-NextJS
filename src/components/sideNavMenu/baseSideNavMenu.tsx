import Image from "next/image";
import logo from "../../images/logo.svg";
import Link from "next/link";

export default function BaseSideNavMenu({
  children,
  accountType,
}: {
  children?: React.ReactNode;
  accountType: string;
}) {
  accountType = accountType ?? "Host";

  return (
    <aside id="main-menu" className="bg-rentality-bg-left-sidebar pl-14 pr-12 pt-12 max-lg:hidden lg:min-w-[300px]">
      <div className="w-40">
        <Link href={"https://rentality.xyz/"}>
          <Image alt="" width={200} height={200} src={logo} />
        </Link>
      </div>
      <nav className="w-full pt-4">{children}</nav>
    </aside>
  );
}
