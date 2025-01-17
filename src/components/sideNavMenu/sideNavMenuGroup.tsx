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
  const { closeBurgerMenu } = useAppContext();

  const handleOnClick = () => {
    closeBurgerMenu();
    if (onClick) {
      onClick();
    }
  };

  let isSelected = false;
  if (typeof window !== "undefined") {
    const currentPathname = window.location.pathname;
    isSelected = currentPathname === href && href.trim() !== "/";
  }

  return (
    <div>
      <div className={`py-2 text-xl font-bold pl-14 ${isSelected ? "bg-rentality-primary rounded-r-full" : ""}`}>
        {href != null ? (
          <Link className="flex flex-row items-center gap-2" href={href} onClick={handleOnClick} target={target}>
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
