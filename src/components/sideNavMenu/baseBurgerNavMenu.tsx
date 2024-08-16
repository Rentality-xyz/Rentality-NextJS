import { useAppContext } from "@/contexts/appContext";
import NavMenuLogo from "./navMenuLogo";

export default function BaseBurgerNavMenu({ children }: { children?: React.ReactNode }) {
  const { closeBurgerMenu } = useAppContext();

  const handleOnClick = () => {
    closeBurgerMenu();
  };

  return (
    <div className="pl-14 pr-12 pt-8">
      <NavMenuLogo onClick={handleOnClick} />
      <nav className="mb-44 w-full pt-4">{children}</nav>
    </div>
  );
}
