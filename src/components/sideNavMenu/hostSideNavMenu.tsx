import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import MenuIcons from "@/components/sideNavMenu/menuIcons";

export default function HostSideNavMenu() {
  return (
    <BaseSideNavMenu accountType={"Host"}>
      <SideNavMenuGroup title="Trips">
        <SideNavMenuItem text="Booked" href="/host/trips/booked" icon={MenuIcons.Booked} />
        <SideNavMenuItem text="History" href="/host/trips/history" icon={MenuIcons.History} />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Vehicles">
        <SideNavMenuItem text="Listing" href="/host/vehicles/listings" icon={MenuIcons.Listings} />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Inbox">
        <SideNavMenuItem text="Messages" href="/host/messages" icon={MenuIcons.Messages} />
      </SideNavMenuGroup>
      <hr />
      <SideNavMenuGroup title="Profile settings" href="/host/profile" icon={MenuIcons.ProfileSettings} />
    </BaseSideNavMenu>
  );
}
