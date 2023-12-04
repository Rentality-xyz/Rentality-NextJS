import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import GuestSideNavMenu from "@/components/sideNavMenu/guestSideNavMenu";
import {AppContextProvider} from "@/contexts/useAppContext";

type Props = {
  children?: React.ReactNode;
};

export default function GuestLayout({ children }: Props) {
  return (
    <>
      <div className="flex text-rnt-temp-sidemenu-text">
          <GuestSideNavMenu />
          <div className="w-full">
              <Header accountType="Guest" />
              <main className="px-4 sm:px-8 py-4 h-full text-rnt-temp-main-text lg:min-h-[600px]">
                  {children}
              </main>
          </div>
      </div>
      <Footer />
    </>
  );
}
