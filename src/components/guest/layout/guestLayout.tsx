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
        <Header  isHost={false} />
        <GuestSideNavMenu />
        <main className="bg-gray-200 bg-opacity-60">{children}</main>
        <Footer />
      </div>
    </>
  );
}
