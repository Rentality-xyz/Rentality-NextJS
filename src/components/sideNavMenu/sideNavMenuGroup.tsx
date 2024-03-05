import Link from "next/link";
import Image from "next/image";
import MenuIcons, { getImageForMenu } from "@/components/sideNavMenu/menuIcons";
import { useAppContext } from "@/contexts/appContext";

export default function SideNavMenuGroup({
  title,
  href,
  children,
  icon,
}: {
  title: string;
  href?: string;
  children?: React.ReactNode;
  icon?: MenuIcons;
}) {
  const { toggleBurgerMenu } = useAppContext();

  return (
    <div className="pt-4">
      <div className="py-2 text-xl font-bold">
        {href != null ? (
          <Link href={href} onClick={toggleBurgerMenu} className="flex">
            {icon != null && <Image src={getImageForMenu(icon)} width={30} height={30} alt="" className="mr-2" />}
            <span>{title}</span>
          </Link>
        ) : (
          title
        )}
      </div>
      {children}
    </div>
  );
}
