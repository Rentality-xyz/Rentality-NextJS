import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";

export default function AdminSideNavMenu() {
  return (
    <BaseSideNavMenu accountType={"Host"}>
      <SideNavMenuGroup title="Contract info" href="/admin" />
    </BaseSideNavMenu>
  );
}
