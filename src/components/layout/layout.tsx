import { useRouter } from "next/router";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import HostSideNavMenu from "../sideNavMenu/hostSideNavMenu";
import GuestSideNavMenu from "../sideNavMenu/guestSideNavMenu";
import AdminSideNavMenu from "../sideNavMenu/adminSideNavMenu";

export default function Layout({ children }: { children?: React.ReactNode }) {
  const router = useRouter();

  const isGuest = router.route.startsWith("/guest");

  if (isGuest)
    return (
      <>
        <div className="flex text-rnt-temp-sidemenu-text overflow-hidden">
          <GuestSideNavMenu />
          <div className="xl:flex xl:flex-col xl:grow w-full">
            <Header accountType="Guest" />
            <main className="px-4 sm:px-8 py-4 h-full text-rnt-temp-main-text">{children}</main>
          </div>
        </div>
        <Footer />
      </>
    );

  const isHost = router.route.startsWith("/host");

  if (isHost)
    return (
      <>
        <div className="flex text-rnt-temp-sidemenu-text overflow-hidden">
          <HostSideNavMenu />
          <div className="w-full">
            <Header accountType="Host" />
            <main className="px-4 sm:px-8 py-4 h-full text-rnt-temp-main-text lg:min-h-[600px]">{children}</main>
          </div>
        </div>
        <Footer />
      </>
    );

  const isAdmin = router.route.startsWith("/admin");

  if (isAdmin)
    return (
      <>
        <div className="flex text-rnt-temp-sidemenu-text overflow-hidden">
          <AdminSideNavMenu />
          <div className="w-full">
            <Header accountType="Admin" />
            <main className="px-4 sm:px-8 py-4 h-full text-rnt-temp-main-text lg:min-h-[600px]">{children}</main>
          </div>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <div className="flex text-rnt-temp-sidemenu-text overflow-hidden">
        <GuestSideNavMenu />
        <div className="w-full">
          <Header accountType="Guest" />
          <main className="px-4 sm:px-8 py-4 h-full text-rnt-temp-main-text lg:min-h-[600px]">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
