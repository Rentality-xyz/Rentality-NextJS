import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import icBooked from "@/images/ic_booked.jpg";
import icHistory from "@/images/ic_history.jpg";
import icMessages from "@/images/ic_messages.jpg";
import icProfileSettings from "@/images/ic_profile_settings.jpg";
import icListings from "@/images/ic_listings.jpg";
import icClaims from "@/images/ic_claims.jpg";
import MenuIcons from "@/components/sideNavMenu/menuIcons";
import { useAppContext } from "@/contexts/appContext";

export default function SideNavMenuGroup({
  title,
  href,
  children,
  icon,
}: {
  title: string;
  href?: string;
  children?: React.ReactNode;
  icon?: MenuIcons;
}) {
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
    }
  };

  return (
    <div className="pt-4">
      <div className="py-2 text-xl font-bold">
        {href != null ? (
          <Link href={href} onClick={toggleBurgerMenu} className="flex">
            {icon != null && <Image src={getImageForMenu(icon)} width={30} height={30} alt="" className="mr-2" />}
            <span>{title}</span>
          </Link>
        ) : (
          title
        )}
      </div>
      {children}
    </div>
  );
}
