import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import HostSideNavMenu from "../sideNavMenu/hostSideNavMenu";
import GuestSideNavMenu from "../sideNavMenu/guestSideNavMenu";
import AdminSideNavMenu from "../sideNavMenu/adminSideNavMenu";
import { useAppContext } from "@/contexts/appContext";
import useUserMode from "@/hooks/useUserMode";
import React, { useEffect, useRef, useState } from "react";
import { DialogActions } from "@/utils/dialogActions";
import { t } from "i18next";
import { useRntDialogs } from "@/contexts/rntDialogsContext";

export default function Layout({ children }: { children?: React.ReactNode }) {
  const { isBurgerMenuShown, isFilterOnSearchPageShown } = useAppContext();
  const { userMode, isHost, isAdmin } = useUserMode();

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

  const footerRef = useRef<HTMLDivElement>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { root: null, threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <>
      <Header />
      <div className="relative flex min-h-[100vh] w-full flex-row overflow-hidden pt-14 text-rnt-temp-sidemenu-text">
        <aside
          id="main-side-menu"
          className={`custom-scroll fixed hidden h-full overflow-y-auto bg-rentality-bg-left-sidebar pb-14 lg:block`}
        >
          <div className={`${isFooterVisible ? `mt-[-400px]` : ``} transition-all duration-300`}>{sideNavMenu}</div>
        </aside>

        <div className="relative flex w-full min-w-0 flex-col lg:ml-[300px] xl:grow">
          <main className="flex h-full flex-col px-4 py-4 text-rnt-temp-main-text sm:px-8">{children}</main>
        </div>
      </div>
      <Footer ref={footerRef} />
    </>
  );
}
