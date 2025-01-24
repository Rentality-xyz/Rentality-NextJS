export default function BaseSideNavMenu({ children }: { children?: React.ReactNode }) {
  return (
    <div className="pr-12 pt-3 lg:min-w-[300px]">
      <nav className="w-full">{children}</nav>
    </div>
  );
}
