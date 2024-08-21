import NavMenuLogo from "./navMenuLogo";

export default function BaseSideNavMenu({ children }: { children?: React.ReactNode }) {
  return (
    <div className="pl-14 pr-12 pt-12 lg:min-w-[300px]">
      <NavMenuLogo />
      <nav className="w-full pt-4">{children}</nav>
    </div>
  );
}
