import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import MenuIcons from "@/components/sideNavMenu/menuIcons";

export default function GuestSideNavMenu() {
  return (
    <BaseSideNavMenu accountType={"Guest"}>
      <SideNavMenuGroup title="Search" href="/guest/search" />
      <SideNavMenuGroup title="Trips">
        <SideNavMenuItem text="Booked" href="/guest/trips/booked" icon={MenuIcons.Booked} />
        <SideNavMenuItem text="History" href="/guest/trips/history" icon={MenuIcons.History} />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Inbox">
        <SideNavMenuItem text="Messages" href="/guest/messages" icon={MenuIcons.Messages} />
        <SideNavMenuItem text="Legal" href="https://rentality.xyz/legalmatters" icon={MenuIcons.Legal} target = "_blank"/>
      </SideNavMenuGroup>
      <hr />
      <SideNavMenuGroup title="Profile settings" href="/guest/profile" icon={MenuIcons.ProfileSettings} />
    </BaseSideNavMenu>
  );
}
