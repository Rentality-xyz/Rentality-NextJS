import { useRouter } from "next/router";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import HostSideNavMenu from "../sideNavMenu/hostSideNavMenu";
import GuestSideNavMenu from "../sideNavMenu/guestSideNavMenu";
import AdminSideNavMenu from "../sideNavMenu/adminSideNavMenu";
import { useEffect } from "react";
import { useAppContext } from "@/contexts/appContext";

export default function Layout({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const { isHideBurgerMenu, isHideFilterOnSearchPage } = useAppContext();

  const isGuest = router.route.startsWith("/guest");

  useEffect(() => {
    const body = document.body;
    if (isHideBurgerMenu || isHideFilterOnSearchPage) {
      body.classList.add("overflow-hidden");
    } else {
      body.classList.remove("overflow-hidden");
    }
  }, [isHideBurgerMenu, isHideFilterOnSearchPage]);

  if (isGuest)
    return (
      <>
        <div className="flex overflow-hidden text-rnt-temp-sidemenu-text">
          <GuestSideNavMenu />
          <div className="w-full xl:flex xl:grow xl:flex-col">
            <Header accountType="Guest" />
            <main className="h-full px-4 py-4 text-rnt-temp-main-text sm:px-8">{children}</main>
          </div>
        </div>
        <Footer />
      </>
    );

  const isHost = router.route.startsWith("/host");

  if (isHost)
    return (
      <>
        <div className="flex overflow-hidden text-rnt-temp-sidemenu-text">
          <HostSideNavMenu />
          <div className="w-full">
            <Header accountType="Host" />
            <main className="px-4 py-4 text-rnt-temp-main-text sm:px-8 lg:min-h-[600px]">{children}</main>
          </div>
        </div>
        <Footer />
      </>
    );

  const isAdmin = router.route.startsWith("/admin");

  if (isAdmin)
    return (
      <>
        <div className="flex overflow-hidden text-rnt-temp-sidemenu-text">
          <AdminSideNavMenu />
          <div className="w-full">
            <Header accountType="Admin" />
            <main className="px-4 py-4 text-rnt-temp-main-text sm:px-8 lg:min-h-[600px]">{children}</main>
          </div>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <div className="flex overflow-hidden text-rnt-temp-sidemenu-text">
        <GuestSideNavMenu />
        <div className="w-full">
          <Header accountType="Guest" />
          <main className="px-4 py-4 text-rnt-temp-main-text sm:px-8 lg:min-h-[600px]">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
