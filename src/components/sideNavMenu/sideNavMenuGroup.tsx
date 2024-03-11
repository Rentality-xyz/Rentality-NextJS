import Link from "next/link";
import Image from "next/image";
import MenuIcons, { getImageForMenu } from "@/components/sideNavMenu/menuIcons";
import { useAppContext } from "@/contexts/appContext";

export default function SideNavMenuGroup({
  title,
  href,
  children,
  icon,
  target = "_self",
  onClick,
}: {
  title: string;
  href?: string;
  children?: React.ReactNode;
  icon?: MenuIcons;
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
    <div className="pt-4">
      <div className="py-2 text-xl font-bold">
        {href != null ? (
          <Link className="flex flex-row gap-2 items-center" href={href} onClick={handleOnClick} target={target}>
            {icon != null && <Image src={getImageForMenu(icon)} width={30} height={30} alt="" />}
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
