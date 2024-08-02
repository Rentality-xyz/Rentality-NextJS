import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import HostSideNavMenu, { HostBurgerNavMenu } from "../sideNavMenu/hostSideNavMenu";
import GuestSideNavMenu, { GuestBurgerNavMenu } from "../sideNavMenu/guestSideNavMenu";
import burgerMenu from "../../images/ic-menu-burge-white-20.svg";
import burgerMenuClose from "../../images/ic-menu-burge-close-white-20.svg";
import AdminSideNavMenu from "../sideNavMenu/adminSideNavMenu";
import { useAppContext } from "@/contexts/appContext";
import useUserMode, { isAdmin, isHost } from "@/hooks/useUserMode";
import Image from "next/image";
import { useEffect } from "react";

export default function Layout({ children }: { children?: React.ReactNode }) {
  const { isBurgerMenuShown, isFilterOnSearchPageShown, toggleBurgerMenu } = useAppContext();
  const { userMode } = useUserMode();

  useEffect(() => {
    const body = document.body;
    if (isBurgerMenuShown || isFilterOnSearchPageShown) {
      body.classList.add("overflow-hidden");
    } else {
      body.classList.remove("overflow-hidden");
    }
  }, [isBurgerMenuShown, isFilterOnSearchPageShown]);

  const sideNavMenu = isHost(userMode) ? (
    <HostSideNavMenu />
  ) : isAdmin(userMode) ? (
    <AdminSideNavMenu />
  ) : (
    <GuestSideNavMenu />
  );
  const burgerNavMenu = isHost(userMode) ? <HostBurgerNavMenu /> : <GuestBurgerNavMenu />;

  return (
    <>
      <div className="flex flex-row w-full min-h-[100vh] text-rnt-temp-sidemenu-text overflow-hidden relative">
        <aside id="main-side-menu" className="hidden lg:block bg-rentality-bg-left-sidebar">
          {sideNavMenu}
        </aside>

        {isBurgerMenuShown && (
          <div
            id="burger-menu-wrapper"
            className="fixed top-[7rem] left-0 w-full h-full z-[100] overflow-auto lg:hidden"
          >
            <aside id="burger-menu" className="bg-rentality-bg-left-sidebar">
              {burgerNavMenu}
            </aside>
          </div>
        )}

        <div className="flex flex-col xl:grow w-full min-w-0 relative ">
          <Image
            src={isBurgerMenuShown ? burgerMenuClose : burgerMenu}
            alt=""
            className="lg:hidden mx-2 absolute left-0 top-[3.25rem]"
            onClick={toggleBurgerMenu}
          />
          <Header />
          <main className="px-4 sm:px-8 py-4 h-full text-rnt-temp-main-text">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
