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
  onClick?: () => void;
}) {
  const { toggleBurgerMenu } = useAppContext();

  const handleOnClick = () => {
    toggleBurgerMenu();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="py-1 h-12">
      <Link className="flex flex-row gap-2 items-center" href={href} onClick={handleOnClick} target={target}>
        {icon != null && <Image src={getImageForMenu(icon)} width={30} height={30} alt="" />}
        <span>{text}</span>
      </Link>
    </div>
  );
}
