import Image from "next/image";
import logo from "../../images/logo.png";

export default function BaseBurgerNavMenu({
  children,
  accountType,
}: {
  children?: React.ReactNode;
  accountType: string;
}) {
  accountType = accountType ?? "Host";

  return (
    <aside id="burger-menu" className="pl-14 pr-12 pt-8 bg-[#1E1E30] text-rnt-temp-sidemenu-text">
      <div className="w-40">
        <Image alt="" width={200} height={200} src={logo} />
      </div>
      <nav className="w-full pt-4 mb-44">{children}</nav>
    </aside>
  );
}
