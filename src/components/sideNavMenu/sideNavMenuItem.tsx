import Link from "next/link";
import Image from "next/image";
import MenuIcons, { getImageForMenu } from "@/components/sideNavMenu/menuIcons";
import { useAppContext } from "@/contexts/appContext";

export default function SideNavMenuItem({
  text,
  href,
  icon,
  target = "_self",
  onClick,
}: {
  text: string;
  href: string;
  icon: MenuIcons;
  target?: string;
  onClick?: () => {};
}) {
  const { toggleBurgerMenu } = useAppContext();

  const handleOnclick = () => {
    toggleBurgerMenu();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="py-1 h-12">
      <Link href={href} onClick={handleOnclick} className="flex" target={target}>
        <Image src={getImageForMenu(icon)} width={30} height={30} alt="" className="mr-2" />
        {icon == MenuIcons.Listings || icon == MenuIcons.Claims ? (
          <span className="pt-2">{text}</span>
        ) : (
          <span className="pt-0.5">{text}</span>
        )}
      </Link>
    </div>
  );
}
