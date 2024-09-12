import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";

export default function AdminSideNavMenu() {
  return (
    <BaseSideNavMenu>
      <SideNavMenuGroup title="Contract info" href="/admin" />
      <SideNavMenuGroup title="Car locations " href="/admin/carLocations" />
      <SideNavMenuGroup title="All trips table " href="/admin/allTrips" />
    </BaseSideNavMenu>
  );
}
