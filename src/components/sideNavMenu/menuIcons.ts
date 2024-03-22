import { StaticImageData } from "next/image";
import icBooked from "@/images/ic_booked.png";
import icClaims from "@/images/ic_claims.png";
import icHistory from "@/images/ic_history.png";
import icLegal from "@/images/ic_legal.png";
import icListings from "@/images/ic_listings.png";
import icLogout from "@/images/ic_logout.png";
import icMessages from "@/images/ic_messages.png";
import icNotifications from "@/images/ic_notifications.png";
import icProfileSettings from "@/images/ic_profile_settings.png";
import icTransactionHistory from "@/images/ic_transaction_history.png";

enum MenuIcons {
  Booked,
  Claims,
  History,
  Legal,
  Listings,
  Logout,
  Messages,
  Notifications,
  ProfileSettings,
  TransactionHistory,
}

export const getImageForMenu = (state: MenuIcons): StaticImageData => {
  switch (state) {
    case MenuIcons.Booked:
      return icBooked;
    case MenuIcons.Claims:
      return icClaims;
    case MenuIcons.History:
      return icHistory;
    case MenuIcons.Legal:
      return icLegal;
    case MenuIcons.Listings:
      return icListings;
    case MenuIcons.Logout:
      return icLogout;
    case MenuIcons.Messages:
      return icMessages;
    case MenuIcons.Notifications:
      return icNotifications;
    case MenuIcons.ProfileSettings:
      return icProfileSettings;
    case MenuIcons.TransactionHistory:
      return icTransactionHistory;
  }
};

export default MenuIcons;
