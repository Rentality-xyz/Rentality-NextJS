import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import AdminSideNavMenu from "@/components/sideNavMenu/adminSideNavMenu";

type Props = {
  children?: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return (
    <>
      <div className="main-grid">
        <Header accountType="Admin" />
        <AdminSideNavMenu />
        <main className="px-8 py-4 bg-gray-200 bg-opacity-60 text-gray-900">{children}</main>
        <Footer />
      </div>
    </>
  );
}
