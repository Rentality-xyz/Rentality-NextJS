import Link from "next/link";
import Image, {StaticImageData} from "next/image";
import icBooked from "@/images/ic_booked.jpg";
import icHistory from "@/images/ic_history.jpg";
import icMessages from "@/images/ic_messages.jpg";
import icProfileSettings from "@/images/ic_profile_settings.jpg";
import icListings from "@/images/ic_listings.jpg";
import icClaims from "@/images/ic_claims.jpg";
import icLegal from "@/images/ic_legal.jpg";
import icTransactionHistory from "@/images/icTransactionHistory.jpg";
import MenuIcons from "@/components/sideNavMenu/menuIcons";
import {useAppContext} from "@/contexts/appContext";

export default function SideNavMenuItem({ text, href, icon, target = '_self'}: { text: string; href: string; icon: MenuIcons, target?: string }) {
  const { toggleBurgerMenu } = useAppContext();

  const getImageForMenu = (state: MenuIcons): StaticImageData => {
    switch (state) {
      case MenuIcons.Booked:
        return icBooked;
      case MenuIcons.History:
        return icHistory;
      case MenuIcons.Messages:
        return icMessages;
      case MenuIcons.ProfileSettings:
        return icProfileSettings;
      case MenuIcons.Listings:
        return icListings;
      case MenuIcons.Claims:
        return icClaims;
      case MenuIcons.Legal:
        return icLegal;
      case MenuIcons.TransactionHistory:
        return icTransactionHistory;
    }
  };

  return (
    <div className="py-1 h-12">
      <Link href={href} onClick={toggleBurgerMenu} className="flex" target={target}>
        <Image src={getImageForMenu(icon)} width={30} height={30} alt="" className="mr-2" />
        {(icon == MenuIcons.Listings || icon == MenuIcons.Claims) ? <span className="pt-2">{text}</span> : <span className="pt-0.5">{text}</span>}
      </Link>
    </div>
  );
}
