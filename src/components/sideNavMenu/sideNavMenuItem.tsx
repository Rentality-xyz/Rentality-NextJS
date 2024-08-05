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

  return (
    <div className="flex py-1 h-12">
      <Link className="flex flex-row gap-2 items-center" href={href} onClick={handleOnClick} target={target}>
        {icon != null && <Image src={getImageForMenu(icon)} width={30} height={30} alt="" />}
        <span>{text}</span>
      </Link>
      {notificationCount && notificationCount > 0 ? (
        <span className="ml-4 rounded-full bg-rentality-primary h-6 w-6 flex justify-center items-center">
          <span className="text-white">{notificationCount <= 9 ? notificationCount : "9+"}</span>
        </span>
      ) : null}
    </div>
  );
}
