import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import AdminSideNavMenu from "@/components/sideNavMenu/adminSideNavMenu";

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <div className="main-grid">
        <Header accountType="Admin" />
        <AdminSideNavMenu />
        <main className="px-8 py-4">{children}</main>
        <Footer />
      </div>
    </>
  );
}
