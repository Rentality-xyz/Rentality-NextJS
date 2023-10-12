import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import BaseBurgerNavMenu from "@/components/sideNavMenu/baseBurgerNavMenu";

export default function GuestBurgerNavMenu() {
  return (
    <BaseBurgerNavMenu accountType={"Guest"}>
      <SideNavMenuGroup title="Search" href="/guest/search" />
      <SideNavMenuGroup title="Trips">
        <SideNavMenuItem text="Booked" href="/guest/trips/booked" />
        <SideNavMenuItem text="History" href="/guest/trips/history" />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Inbox">
        <SideNavMenuItem text="Messages" href="/guest/messages" />
      </SideNavMenuGroup>
      <hr/>
      <SideNavMenuGroup title="Profile settings" href="/guest/profile" />
    </BaseBurgerNavMenu>
  );
}
