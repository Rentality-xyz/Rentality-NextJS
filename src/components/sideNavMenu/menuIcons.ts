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
  ReferralsAndPoints,
}

export const getImageForMenu = (state: MenuIcons): string => {
  switch (state) {
    case MenuIcons.Booked:
      return "/images/icons/menu/ic_booked.svg";
    case MenuIcons.Claims:
      return "/images/icons/menu/ic_claims.svg";
    case MenuIcons.History:
      return "/images/icons/menu/ic_history.svg";
    case MenuIcons.Legal:
      return "/images/icons/menu/ic_legal.svg";
    case MenuIcons.Listings:
      return "/images/icons/menu/ic_listings.svg";
    case MenuIcons.Logout:
      return "/images/icons/menu/ic_logout.svg";
    case MenuIcons.Messages:
      return "/images/icons/menu/ic_messages.svg";
    case MenuIcons.Notifications:
      return "/images/icons/menu/ic_notifications.svg";
    case MenuIcons.ProfileSettings:
      return "/images/icons/menu/ic_profile_settings.svg";
    case MenuIcons.TransactionHistory:
      return "/images/icons/menu/ic_transaction_history.svg";
    case MenuIcons.Search:
      return "/images/icons/menu/ic-search-128.svg";
    case MenuIcons.Insurance:
      return "/images/icons/menu/ic_insurance.svg";
    case MenuIcons.ToAppStore:
      return "/images/marketplace/ic_appstore.svg";
    case MenuIcons.ToGooglePlay:
      return "/images/marketplace/ic_google_play.svg";
    case MenuIcons.ReferralsAndPoints:
      return "/images/icons/menu/ic_referrals_and_points.png";
    case MenuIcons.Invest:
      return "/images/icons/menu/ic_invest.png";
  }
};

export default MenuIcons;
