import { useAppContext } from "@/contexts/appContext";
import NavMenuLogo from "./navMenuLogo";

export default function BaseBurgerNavMenu({ children }: { children?: React.ReactNode }) {
  const { toggleBurgerMenu } = useAppContext();

  const handleOnClick = () => {
    toggleBurgerMenu();
  };

  return (
    <aside id="burger-menu" className="pl-14 pr-12 pt-8 bg-[#1E1E30] text-rnt-temp-sidemenu-text">
      <NavMenuLogo onClick={handleOnClick} />
      <nav className="w-full pt-4 mb-44">{children}</nav>
    </aside>
  );
}
