import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import HostSideNavMenu from "@/components/sideNavMenu/hostSideNavMenu";
import {AppContextProvider} from "@/contexts/useAppContext";

type Props = {
  children?: React.ReactNode;
};

export default function HostLayout({ children }: Props) {
  return (
    <>
      <div className="flex text-rnt-temp-sidemenu-text">
          <HostSideNavMenu />
          <div className="w-full">
              <Header accountType="Host" />
              <main className="px-8 py-4 h-full text-rnt-temp-main-text lg:min-h-[600px]">
                  {children}
              </main>
          </div>
      </div>
      <Footer />
    </>
  );
}
