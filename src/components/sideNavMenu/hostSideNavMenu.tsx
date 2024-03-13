import { usePrivy } from "@privy-io/react-auth";
import BaseBurgerNavMenu from "./baseBurgerNavMenu";
import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import MenuIcons from "@/components/sideNavMenu/menuIcons";

function HostNavMenu() {
  const { ready, authenticated, logout } = usePrivy();

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
        <SideNavMenuItem text="Notifications" href="/host/notifications" icon={MenuIcons.Notifications} />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="More">
        <SideNavMenuItem
          text="Legal"
          href="https://rentality.xyz/legalmatters"
          icon={MenuIcons.Legal}
          target="_blank"
        />
        <SideNavMenuItem text="Profile settings" href="/host/profile" icon={MenuIcons.ProfileSettings} />
        {ready && authenticated ? (
          <SideNavMenuItem text="Logout" href="/" onClick={logout} icon={MenuIcons.Logout} />
        ) : null}
      </SideNavMenuGroup>
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
