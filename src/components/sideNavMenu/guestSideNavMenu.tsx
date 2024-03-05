import BaseBurgerNavMenu from "./baseBurgerNavMenu";
import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import MenuIcons from "@/components/sideNavMenu/menuIcons";

function GuestNavMenu() {
  return (
    <>
      <SideNavMenuGroup title="Search" href="/guest/search" />
      <SideNavMenuGroup title="Trips">
        <SideNavMenuItem text="Booked" href="/guest/trips/booked" icon={MenuIcons.Booked} />
        <SideNavMenuItem text="History" href="/guest/trips/history" icon={MenuIcons.History} />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Inbox">
        <SideNavMenuItem text="Messages" href="/guest/messages" icon={MenuIcons.Messages} />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="More">
        <SideNavMenuItem text="Claims" href="/guest/claims" icon={MenuIcons.Claims} />
        <SideNavMenuItem text="Legal" href="https://rentality.xyz/legalmatters" icon={MenuIcons.Legal} target = "_blank"/>
        <SideNavMenuItem text="Transaction history" href="/guest/transactionHistory" icon={MenuIcons.TransactionHistory} />
        <SideNavMenuItem text="Profile settings" href="/guest/profile" icon={MenuIcons.ProfileSettings} />
      </SideNavMenuGroup>
    </>
  );
}

export default function GuestSideNavMenu() {
  return (
    <BaseSideNavMenu accountType={"Guest"}>
      <GuestNavMenu />
    </BaseSideNavMenu>
  );
}

export function GuestBurgerNavMenu() {
  return (
    <BaseBurgerNavMenu accountType={"Guest"}>
      <GuestNavMenu />
    </BaseBurgerNavMenu>
  );
}
