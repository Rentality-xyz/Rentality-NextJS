import { StaticImageData } from "next/image";
import icBooked from "@/images/ic_booked.svg";
import icClaims from "@/images/ic_claims.svg";
import icHistory from "@/images/ic_history.svg";
import icLegal from "@/images/ic_legal.svg";
import icListings from "@/images/ic_listings.svg";
import icLogout from "@/images/ic_logout.svg";
import icMessages from "@/images/ic_messages.svg";
import icNotifications from "@/images/ic_notifications.svg";
import icProfileSettings from "@/images/ic_profile_settings.svg";
import icTransactionHistory from "@/images/ic_transaction_history.svg";
import icSearch from "@/images/ic-search-128.svg";
import icInsurance from "@/images/ic_insurance.svg";
import toAppStore from "@/images/to_app_store.png";
import toGooglePlay from "@/images/to_google_play.png";
import icCreateInvest from "@/images/ic-create-invest.jpg";
import icReferralsAndPoints from "@/images/ic_referrals_and_points.png";
import icInvest from "@/images/ic_invest.png";

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
  Insurance,
  ToAppStore,
  ToGooglePlay,
  Invest,
  CreateInvest,
  ReferralsAndPoints,
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
    case MenuIcons.Insurance:
      return icInsurance;
    case MenuIcons.ToAppStore:
      return toAppStore;
    case MenuIcons.ToGooglePlay:
      return toGooglePlay;
    case MenuIcons.ReferralsAndPoints:
      return icReferralsAndPoints;
    case MenuIcons.Invest:
      return icInvest;
    case MenuIcons.CreateInvest:
      return icCreateInvest;
  }
};

export default MenuIcons;
