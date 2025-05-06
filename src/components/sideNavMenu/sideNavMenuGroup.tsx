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
  selectedMenuHref,
}: {
  title: string;
  href?: string;
  children?: React.ReactNode;
  icon?: MenuIcons;
  target?: string;
  onClick?: (href: string) => void;
  selectedMenuHref?: string;
}) {
  const { closeBurgerMenu } = useAppContext();

  const handleOnClick = () => {
    closeBurgerMenu();
    if (onClick && href) {
      onClick(href);
    }
  };

  let isSelected = false;
  if (href && selectedMenuHref) {
    isSelected = selectedMenuHref.startsWith(href) && href.trim() !== "/";
  }

  return (
    <div>
      <div className={`py-2 pl-14 text-xl font-bold ${isSelected ? "rounded-r-full bg-rentality-primary" : ""}`}>
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
