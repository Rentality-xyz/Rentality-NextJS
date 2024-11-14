import { useAppContext } from "@/contexts/appContext";
import HeaderLogo from "./headerLogo";

export default function BaseBurgerNavMenu({ children }: { children?: React.ReactNode }) {
  const { closeBurgerMenu } = useAppContext();

  const handleOnClick = () => {
    closeBurgerMenu();
  };

  return (
    <div className="pl-4 pr-12">
      <HeaderLogo onClick={handleOnClick} />
      <nav className="mb-44 w-full pt-4">{children}</nav>
    </div>
  );
}
