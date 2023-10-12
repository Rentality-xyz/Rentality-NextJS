import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import BaseBurgerNavMenu from "@/components/sideNavMenu/baseBurgerNavMenu";

export default function HostBurgerNavMenu() {
  return (
    <BaseBurgerNavMenu accountType={"Host"}>
      <SideNavMenuGroup title="Trips">
        <SideNavMenuItem text="Booked" href="/host/trips/booked" />
        <SideNavMenuItem text="History" href="/host/trips/history" />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Vehicles">
        <SideNavMenuItem text="Listing" href="/host/vehicles/listings" />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Inbox">
        <SideNavMenuItem text="Messages" href="/host/messages" />
      </SideNavMenuGroup>
      <hr/>
      <SideNavMenuGroup title="Profile settings" href="/host/profile" />
    </BaseBurgerNavMenu>
  );
}
