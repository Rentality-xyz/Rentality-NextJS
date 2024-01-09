import BaseBurgerNavMenu from "./baseBurgerNavMenu";
import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import MenuIcons from "@/components/sideNavMenu/menuIcons";

function HostNavMenu() {
  return (
    <>
      <SideNavMenuGroup title="Trips">
        <SideNavMenuItem text="Booked" href="/host/trips/booked" icon={MenuIcons.Booked} />
        <SideNavMenuItem text="History" href="/host/trips/history" icon={MenuIcons.History} />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Vehicles">
        <SideNavMenuItem text="Listing" href="/host/vehicles/listings" icon={MenuIcons.Listings} />
        <SideNavMenuItem text="Claims" href="/host/claims" icon={MenuIcons.Claims} />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Inbox">
        <SideNavMenuItem text="Messages" href="/host/messages" icon={MenuIcons.Messages} />
      </SideNavMenuGroup>
      <hr />
      <SideNavMenuGroup title="Profile settings" href="/host/profile" icon={MenuIcons.ProfileSettings} />
    </>
  );
}

export default function HostSideNavMenu() {
  return (
    <BaseSideNavMenu accountType={"Host"}>
      <HostNavMenu />
    </BaseSideNavMenu>
  );
}

export function HostBurgerNavMenu() {
  return (
    <BaseBurgerNavMenu accountType={"Host"}>
      <HostNavMenu />
    </BaseBurgerNavMenu>
  );
}
