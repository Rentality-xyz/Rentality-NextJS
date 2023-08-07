import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import HostSideNavMenu from "@/components/sideNavMenu/hostSideNavMenu";

type Props = {
  children?: React.ReactNode;
};

export default function HostLayout({ children }: Props) {
  return (
    <>
      <div className="main-grid">
        <Header accountType="Host" />
        <HostSideNavMenu />
        <main className="px-8 py-4">{children}</main>
        <Footer />
      </div>
    </>
  );
}
