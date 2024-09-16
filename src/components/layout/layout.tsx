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
import React, { useEffect } from "react";
import icGoogleStore from "@/images/ic-google-play-store.svg";
import icAppStore from "@/images/ic-apple.svg";
import imgStore from "@/images/app-google-store.svg";
import logo from "@/images/logo.svg";
import HeaderLogo from "@/components/sideNavMenu/headerLogo";

export default function Layout({ children }: { children?: React.ReactNode }) {
  const { isBurgerMenuShown, isFilterOnSearchPageShown, openBurgerMenu, closeBurgerMenu } = useAppContext();
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
     {/*<div className="fixed flex justify-between items-center w-full bg-rentality-bg-dark py-2 px-14 z-50">*/}
         {/*{isBurgerMenuShown && (*/}
         {/*    <div*/}
         {/*        id="burger-menu-wrapper"*/}
         {/*        className="fixed left-0 top-[7rem] z-[100] h-full w-full overflow-auto lg:hidden"*/}
         {/*    >*/}
         {/*        <aside id="burger-menu" className="bg-rentality-bg-left-sidebar">*/}
         {/*            {burgerNavMenu}*/}
         {/*        </aside>*/}
         {/*    </div>*/}
         {/*)}*/}

         {/*<div className="relative flex w-full min-w-0 flex-col xl:grow">*/}
         {/*    <Image*/}
         {/*        src={isBurgerMenuShown ? burgerMenuClose : burgerMenu}*/}
         {/*        alt=""*/}
         {/*        className="absolute left-0 top-[3.25rem] mx-2 lg:hidden"*/}
         {/*        onClick={isBurgerMenuShown ? closeBurgerMenu : openBurgerMenu}*/}
         {/*    />*/}
         {/*</div>*/}
         <Header />
     {/*</div>*/}
      <div className="relative pt-16 flex min-h-[100vh] w-full flex-row overflow-hidden text-rnt-temp-sidemenu-text">
        <aside id="main-side-menu" className="hidden bg-rentality-bg-left-sidebar lg:block">
          {sideNavMenu}
        </aside>

        <div className="relative flex w-full min-w-0 flex-col xl:grow">
          <main className="flex h-full flex-col px-4 py-4 text-rnt-temp-main-text sm:px-8">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
