import Link from "next/link";
import Image from "next/image";
import MenuIcons, { getImageForMenu } from "@/components/sideNavMenu/menuIcons";
import { useAppContext } from "@/contexts/appContext";
import { cn } from "@/utils";

export default function SideNavMenuItem({
  text,
  href,
  icon,
  target = "_self",
  onClick,
  notificationCount,
}: {
  text: string;
  href: string;
  icon: MenuIcons;
  target?: string;
  onClick?: () => void;
  notificationCount?: number;
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
    <div className={`flex h-12 py-1 pl-14 ${isSelected ? "rounded-r-full bg-rentality-primary" : ""}`}>
      <Link className="flex flex-row items-center gap-2" href={href} onClick={handleOnClick} target={target}>
        {icon != null && <Image src={getImageForMenu(icon)} width={30} height={30} alt="" />}
        <span>{text}</span>
      </Link>
      {notificationCount && notificationCount > 0 ? (
        <span className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-rentality-primary">
          <span className="text-white">{notificationCount <= 9 ? notificationCount : "9+"}</span>
        </span>
      ) : null}
    </div>
  );
}
