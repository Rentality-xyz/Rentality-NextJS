import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import HostSideNavMenu from "@/components/host/sideNavMenu/hostSideNavMenu";

type Props = {
  children?: React.ReactNode;
};

export default function HostLayout({ children }: Props) {
  return (
    <>
      {/* <div className="flex flex-col w-full h-full px-16 text-white">
        <div className="flex flex-row w-full bg-red-400">
          <HostSideNavMenu />
          <div className="flex flex-col w-full h-auto bg-amber-300">
            <HostHeader />
            <main className="main w-full h-full bg-orange-300">{children}</main>
          </div>
        </div>
        <Footer />
      </div> */}

      <div className="main-grid">
        <Header accountType="Host" />
        <HostSideNavMenu />
        <main className="bg-gray-200 bg-opacity-60 text-gray-900">{children}</main>
        <Footer />
      </div>
    </>
  );
}
