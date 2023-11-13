import Image from "next/image";
import logo from "../../images/logo.png";
import SideNavMenuGroup from "@/components/sideNavMenu/sideNavMenuGroup";
import Link from "next/link";
import RntButton from "@/components/common/rntButton";
import {ButtonMode, IdentityButton} from "@civic/ethereum-gateway-react";
import HostBurgerNavMenu from "@/components/sideNavMenu/hostBurgerNavMenu";
import GuestBurgerNavMenu from "@/components/sideNavMenu/guestBurgerNavMenu";

type Props = {
    children?: React.ReactNode;
    accountType: string;
};

export default function BaseBurgerNavMenu({children, accountType}:Props) {
    accountType = accountType ?? "Host";
    const isHost = accountType === "Host";

  return (
    <aside id="burger-menu" className="pl-14 pr-12 pt-8 bg-[#1E1E30] text-rnt-temp-sidemenu-text">
      <div className="w-40">
        <Image alt="" width={200} height={200} src={logo} />
      </div>
      <nav className="w-full pt-4">
          {children}
          <div className="py-4 pb-[120px]">
              <hr/>
              {isHost ? (
                  <SideNavMenuGroup title="Switch to Guest" href="/guest" />
              ) : (
                  <SideNavMenuGroup title="Switch to Host" href="/host" />
              )}
          </div>
      </nav>
    </aside>
  );
}
