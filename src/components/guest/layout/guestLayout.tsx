import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import GuestSideNavMenu from "@/components/sideNavMenu/guestSideNavMenu";

type Props = {
  children?: React.ReactNode;
};

export default function GuestLayout({ children }: Props) {
  return (
    <>
      <div className="main-grid">
        <Header accountType="Guest" />
        <GuestSideNavMenu />
        <main className="px-8 py-4 lg:min-h-[600px]">{children}</main>
        <Footer />
      </div>
    </>
  );
}
