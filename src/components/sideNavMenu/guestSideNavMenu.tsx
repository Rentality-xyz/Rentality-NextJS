import BaseBurgerNavMenu from "./baseBurgerNavMenu";
import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import MenuIcons from "@/components/sideNavMenu/menuIcons";
import { useNotification } from "@/features/notifications/contexts/notificationContext";
import usePageLastVisit from "@/hooks/usePageLastVisit";
import { NotificationType } from "@/model/NotificationInfo";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import { useChat } from "@/features/chat/contexts/chatContext";
import { useAuth } from "@/contexts/auth/authContext";
import * as React from "react";
import useFeatureFlags from "@/features/featureFlags/hooks/useFeatureFlags";
import { FEATURE_FLAGS } from "@/features/featureFlags/utils";
import { useState } from "react";

function GuestNavMenu() {
  const { isAuthenticated, logout } = useAuth();
  const { notifications } = useNotification();
  const { chatInfos } = useChat();
  const { getPageLastVisitedDateTime } = usePageLastVisit();
  const { hasFeatureFlag } = useFeatureFlags();
  const [hasInvestmentFeatureFlag, setInvestmentFeatureFlag] = React.useState<boolean>(false);
  const { t } = useTranslation();
  const [selectedMenuHref, setSelectedMenuHref] = useState("/");

  React.useEffect(() => {
    hasFeatureFlag(FEATURE_FLAGS.FF_INVESTMENTS).then((hasInvestmentFeatureFlag: boolean) => {
      setInvestmentFeatureFlag(hasInvestmentFeatureFlag);
    });
  }, [hasFeatureFlag]);

  const t_nav: TFunction = (name, options) => {
    return t("nav_menu." + name, options);
  };

  const bookedLastVisitedDateTime = getPageLastVisitedDateTime("guest_trips_booked");
  const historyLastVisitedDateTime = getPageLastVisitedDateTime("guest_trips_history");
  const claimsLastVisitedDateTime = getPageLastVisitedDateTime("guest_claims");
  const messagesLastVisitedDateTime = getPageLastVisitedDateTime("guest_messages");
  const notificationsLastVisitedDateTime = getPageLastVisitedDateTime("guest_notifications");

  const bookedNotificationCount = notifications.filter(
    (n) => n.type === NotificationType.Booked && n.datestamp > bookedLastVisitedDateTime
  ).length;
  const historyNotificationCount = notifications.filter(
    (n) => n.type === NotificationType.History && n.datestamp > historyLastVisitedDateTime
  ).length;
  const claimsNotificationCount = notifications.filter(
    (n) => n.type === NotificationType.Claim && n.datestamp > claimsLastVisitedDateTime
  ).length;
  const messagesNotificationCount = chatInfos.filter(
    (ci) => ci.messages.filter((m) => m.datestamp > messagesLastVisitedDateTime).length > 0
  ).length;
  const notificationsNotificationCount = notifications.filter(
    (n) => n.datestamp > notificationsLastVisitedDateTime
  ).length;

  return (
    <>
      <SideNavMenuGroup
        title={t_nav("search")}
        href="/guest/search"
        icon={MenuIcons.Search}
        onClick={setSelectedMenuHref}
        selectedMenuHref={selectedMenuHref}
      />
      <SideNavMenuGroup title={t_nav("trips")}>
        <SideNavMenuItem
          text={t_nav("booked")}
          href="/guest/trips/booked"
          icon={MenuIcons.Booked}
          notificationCount={bookedNotificationCount}
          onClick={setSelectedMenuHref}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("history")}
          href="/guest/trips/history"
          icon={MenuIcons.History}
          notificationCount={historyNotificationCount}
          onClick={setSelectedMenuHref}
          selectedMenuHref={selectedMenuHref}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title={t_nav("inbox")}>
        <SideNavMenuItem
          text={t_nav("messages")}
          href="/guest/messages"
          icon={MenuIcons.Messages}
          notificationCount={messagesNotificationCount}
          onClick={setSelectedMenuHref}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("notifications")}
          href="/guest/notifications"
          icon={MenuIcons.Notifications}
          notificationCount={notificationsNotificationCount}
          onClick={setSelectedMenuHref}
          selectedMenuHref={selectedMenuHref}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title={t_nav("more")}>
        <SideNavMenuItem
          text={t_nav("insurance")}
          href="/guest/insurance"
          icon={MenuIcons.Insurance}
          onClick={setSelectedMenuHref}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("complaints")}
          href="/guest/claims"
          icon={MenuIcons.Claims}
          notificationCount={claimsNotificationCount}
          onClick={setSelectedMenuHref}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("legal")}
          href="/guest/legal"
          icon={MenuIcons.Legal}
          onClick={setSelectedMenuHref}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("transaction_history")}
          href="/guest/transaction_history"
          icon={MenuIcons.TransactionHistory}
          onClick={setSelectedMenuHref}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("referrals_and_points")}
          href="/guest/points"
          icon={MenuIcons.ReferralsAndPoints}
          onClick={setSelectedMenuHref}
          selectedMenuHref={selectedMenuHref}
        />
        {hasInvestmentFeatureFlag && (
          <SideNavMenuItem
            text={t_nav("invest")}
            href="/guest/invest"
            icon={MenuIcons.Invest}
            onClick={setSelectedMenuHref}
            selectedMenuHref={selectedMenuHref}
          />
        )}
        <SideNavMenuItem
          text={t_nav("profile")}
          href="/guest/profile"
          icon={MenuIcons.ProfileSettings}
          onClick={setSelectedMenuHref}
          selectedMenuHref={selectedMenuHref}
        />
        {isAuthenticated ? (
          <SideNavMenuItem
            text={t_nav("logout")}
            href="/"
            onClick={logout}
            icon={MenuIcons.Logout}
            selectedMenuHref={selectedMenuHref}
          />
        ) : null}
      </SideNavMenuGroup>
    </>
  );
}

export default function GuestSideNavMenu() {
  return (
    <BaseSideNavMenu>
      <GuestNavMenu />
    </BaseSideNavMenu>
  );
}

export function GuestBurgerNavMenu() {
  return (
    <BaseBurgerNavMenu>
      <GuestNavMenu />
    </BaseBurgerNavMenu>
  );
}
