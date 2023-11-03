import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import BaseBurgerNavMenu from "@/components/sideNavMenu/baseBurgerNavMenu";
import MenuIcons from "@/components/sideNavMenu/menuIcons";

export default function GuestBurgerNavMenu() {
  return (
    <BaseBurgerNavMenu accountType={"Guest"}>
      <SideNavMenuGroup title="Search" href="/guest/search" />
      <SideNavMenuGroup title="Trips">
        <SideNavMenuItem text="Booked" href="/guest/trips/booked" icon={MenuIcons.Booked} />
        <SideNavMenuItem text="History" href="/guest/trips/history" icon={MenuIcons.History} />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Inbox">
        <SideNavMenuItem text="Messages" href="/guest/messages" icon={MenuIcons.Messages} />
      </SideNavMenuGroup>
      <hr />
      <SideNavMenuGroup title="Profile settings" href="/guest/profile" icon={MenuIcons.ProfileSettings} />
    </BaseBurgerNavMenu>
  );
}
