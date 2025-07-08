"use client";

import BaseBurgerNavMenu from "./baseBurgerNavMenu";
import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import MenuIcons from "@/components/sideNavMenu/menuIcons";
import { useNotification } from "@/features/notifications/contexts/notificationContext";
import { NotificationType } from "@/model/NotificationInfo";
import usePageLastVisit from "@/hooks/usePageLastVisit";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import { useChat } from "@/features/chat/contexts/chatContext";
import { useAuth } from "@/contexts/auth/authContext";
import * as React from "react";
import useFeatureFlags from "@/features/featureFlags/hooks/useFeatureFlags";
import { FEATURE_FLAGS } from "@/features/featureFlags/utils";
import { useState } from "react";
import { useRouter } from "next/router";

function HostNavMenu() {
  const { isAuthenticated, logout } = useAuth();
  const { notifications } = useNotification();
  const { chatInfos } = useChat();
  const { getPageLastVisitedDateTime } = usePageLastVisit();
  const { hasFeatureFlag } = useFeatureFlags();
  const [hasInvestmentFeatureFlag, setInvestmentFeatureFlag] = React.useState<boolean>(false);
  const { t } = useTranslation();

  const router = useRouter();
  const normalizePathname = (pathname: string) => {
    if (
      pathname === "/host" ||
      pathname.startsWith("/host/vehicles/edit") ||
      pathname.startsWith("/host/vehicles/listings")
    ) {
      return "/host/vehicles/listings";
    }

    return pathname;
  };

  const selectedMenuHref = normalizePathname(router.pathname);

  React.useEffect(() => {
    hasFeatureFlag(FEATURE_FLAGS.FF_INVESTMENTS).then((hasInvestmentFeatureFlag: boolean) => {
      setInvestmentFeatureFlag(hasInvestmentFeatureFlag);
    });
  }, [hasFeatureFlag]);

  const t_nav: TFunction = (name, options) => {
    return t("nav_menu." + name, options);
  };

  const bookedLastVisitedDateTime = getPageLastVisitedDateTime("host_trips_booked");
  const historyLastVisitedDateTime = getPageLastVisitedDateTime("host_trips_history");
  const claimsLastVisitedDateTime = getPageLastVisitedDateTime("host_claims");
  const messagesLastVisitedDateTime = getPageLastVisitedDateTime("host_messages");
  const notificationsLastVisitedDateTime = getPageLastVisitedDateTime("host_notifications");

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
      <SideNavMenuGroup title={t_nav("trips")}>
        <SideNavMenuItem
          text={t_nav("booked")}
          href="/host/trips/booked"
          icon={MenuIcons.Booked}
          notificationCount={bookedNotificationCount}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("history")}
          href="/host/trips/history"
          icon={MenuIcons.History}
          notificationCount={historyNotificationCount}
          selectedMenuHref={selectedMenuHref}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title={t_nav("vehicles")}>
        <SideNavMenuItem
          text={t_nav("listing")}
          href="/host/vehicles/listings"
          icon={MenuIcons.Listings}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("insurance")}
          href="/host/insurance"
          icon={MenuIcons.Insurance}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("complaints")}
          href="/host/claims"
          icon={MenuIcons.Claims}
          notificationCount={claimsNotificationCount}
          selectedMenuHref={selectedMenuHref}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title={t_nav("inbox")}>
        <SideNavMenuItem
          text={t_nav("messages")}
          href="/host/messages"
          icon={MenuIcons.Messages}
          notificationCount={messagesNotificationCount}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("notifications")}
          href="/host/notifications"
          icon={MenuIcons.Notifications}
          notificationCount={notificationsNotificationCount}
          selectedMenuHref={selectedMenuHref}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title={t_nav("more")}>
        <SideNavMenuItem
          text={t_nav("legal")}
          href="/host/legal"
          icon={MenuIcons.Legal}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("transaction_history")}
          href="/host/transaction_history"
          icon={MenuIcons.TransactionHistory}
          selectedMenuHref={selectedMenuHref}
        />
        <SideNavMenuItem
          text={t_nav("referrals_and_points")}
          href="/host/points"
          icon={MenuIcons.ReferralsAndPoints}
          selectedMenuHref={selectedMenuHref}
        />
        {hasInvestmentFeatureFlag && (
          <SideNavMenuItem
            text={t_nav("invest")}
            href="/host/invest"
            icon={MenuIcons.Invest}
            selectedMenuHref={selectedMenuHref}
          />
        )}
      </SideNavMenuGroup>
      <div className="relative mb-6 mt-6 h-[2px] w-full">
        <div className="absolute right-[-48px] top-0 h-[2px] w-[97%] bg-[#40404F] sm:w-[98%] lg:w-[96%]" />
      </div>
      <SideNavMenuItem
        text={t_nav("profile")}
        href="/host/profile"
        icon={MenuIcons.ProfileSettings}
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
    </>
  );
}

export default function HostSideNavMenu() {
  return (
    <BaseSideNavMenu>
      <HostNavMenu />
    </BaseSideNavMenu>
  );
}

export function HostBurgerNavMenu() {
  return (
    <BaseBurgerNavMenu>
      <HostNavMenu />
    </BaseBurgerNavMenu>
  );
}
