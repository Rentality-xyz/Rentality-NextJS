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
import icSearch from "@/images/ic-search-128.svg";
import toAppStore from "@/images/to_app_store.png";
import toGooglePlay from "@/images/to_google_play.png";

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
  Search,
  ToAppStore,
  ToGooglePlay,
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
    case MenuIcons.Search:
      return icSearch;
    case MenuIcons.ToAppStore:
      return toAppStore;
    case MenuIcons.ToGooglePlay:
      return toGooglePlay;
  }
};

export default MenuIcons;
