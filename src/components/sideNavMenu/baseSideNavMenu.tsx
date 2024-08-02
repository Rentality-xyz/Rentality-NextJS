import NavMenuLogo from "./navMenuLogo";

export default function BaseSideNavMenu({ children }: { children?: React.ReactNode }) {
  return (
    <aside id="main-menu" className="lg:min-w-[300px] pl-14 pr-12 pt-12 bg-rentality-bg-left-sidebar max-lg:hidden">
      <NavMenuLogo />
      <nav className="w-full pt-4">{children}</nav>
    </aside>
  );
}
