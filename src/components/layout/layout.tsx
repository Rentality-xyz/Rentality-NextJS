import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import HostSideNavMenu, { HostBurgerNavMenu } from "../sideNavMenu/hostSideNavMenu";
import GuestSideNavMenu, { GuestBurgerNavMenu } from "../sideNavMenu/guestSideNavMenu";
import AdminSideNavMenu from "../sideNavMenu/adminSideNavMenu";
import { useAppContext } from "@/contexts/appContext";
import useUserMode, { isAdmin, isHost } from "@/hooks/useUserMode";
import React, { useEffect } from "react";

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

  return (
    <>
      <Header />
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
