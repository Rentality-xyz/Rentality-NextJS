import Footer from "@/components/footer/footer";
import GuestSideNavMenu from "../sideNavMenu/guestSideNavMenu";
import Header from "@/components/header/header";

type Props = {
  children?: React.ReactNode;
};

export default function GuestLayout({ children }: Props) {
  return (
    <>
      <div className="main-grid">
        <Header accountType="Guest" />
        <GuestSideNavMenu />
        <main className="px-8 py-4 bg-gray-200 bg-opacity-60 text-gray-900">{children}</main>
        <Footer />
      </div>
    </>
  );
}
