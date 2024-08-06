import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";
import { useAppContext } from "@/contexts/appContext";

export default function BaseBurgerNavMenu({
  children,
  accountType,
}: {
  children?: React.ReactNode;
  accountType: string;
}) {
  const { closeBurgerMenu } = useAppContext();
  accountType = accountType ?? "Host";

  const handleOnClick = () => {
    closeBurgerMenu();
  };

  return (
    <aside id="burger-menu" className="bg-[#1E1E30] pl-14 pr-12 pt-8 text-rnt-temp-sidemenu-text">
      <div className="w-40">
        <Link href={"https://rentality.xyz/"} onClick={handleOnClick}>
          <Image alt="" width={200} height={200} src={logo} />
        </Link>
      </div>
      <nav className="mb-44 w-full pt-4">{children}</nav>
    </aside>
  );
}
