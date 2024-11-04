import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import HostSideNavMenu from "../sideNavMenu/hostSideNavMenu";
import GuestSideNavMenu from "../sideNavMenu/guestSideNavMenu";
import AdminSideNavMenu from "../sideNavMenu/adminSideNavMenu";
import { useAppContext } from "@/contexts/appContext";
import useUserMode, { isAdmin, isHost } from "@/hooks/useUserMode";
import React, { useEffect, useState } from "react";
import { DialogActions } from "@/utils/dialogActions";
import { t } from "i18next";
import { useRntDialogs } from "@/contexts/rntDialogsContext";

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

  const { showDialog, hideDialogs } = useRntDialogs();
  const [smallScreenDialogShown, setSmallScreenDialogShown] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      const screenWidth = window.matchMedia("(max-width: 409px)");

      if (screenWidth.matches && !smallScreenDialogShown) {
        const action = <>{DialogActions.OK(hideDialogs)}</>;
        showDialog(t("common.info.small_screen"), action);
        setSmallScreenDialogShown(true);
      }
    };

    checkScreenWidth();

    window.addEventListener("resize", checkScreenWidth);
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, [smallScreenDialogShown, showDialog, hideDialogs, t]);

  return (
    <>
      <Header />
      <div className="relative flex min-h-[100vh] w-full flex-row overflow-hidden pt-14 text-rnt-temp-sidemenu-text">
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
