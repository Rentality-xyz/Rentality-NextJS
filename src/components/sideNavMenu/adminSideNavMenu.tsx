import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";

export default function AdminSideNavMenu() {
  return (
    <BaseSideNavMenu>
      <SideNavMenuGroup title="Contract info" href="/admin" />
    </BaseSideNavMenu>
  );
}
