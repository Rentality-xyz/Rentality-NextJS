import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";

export default function GuestSideNavMenu() {
  return (
    <BaseSideNavMenu>
      <SideNavMenuGroup title="Search" href="/guest/search" />
      <SideNavMenuGroup title="Trips">
        <SideNavMenuItem text="Booked" href="/guest/trips/booked" />
        <SideNavMenuItem text="History" href="/guest/trips/history" />
      </SideNavMenuGroup>
    </BaseSideNavMenu>
  );
}
