"use client";

import { usePrivy } from "@privy-io/react-auth";
import BaseBurgerNavMenu from "./baseBurgerNavMenu";
import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import MenuIcons from "@/components/sideNavMenu/menuIcons";
import { useNotification } from "@/contexts/notification/notificationContext";
import { NotificationType } from "@/model/NotificationInfo";
import usePageLastVisit from "@/hooks/usePageLastVisit";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import { useChat } from "@/contexts/firebaseChatContext";

function HostNavMenu() {
  const { ready, authenticated, logout } = usePrivy();
  const { notifications } = useNotification();
  const { chatInfos } = useChat();
  const { getPageLastVisitedDateTime } = usePageLastVisit();
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
  const { t } = useTranslation();
  const t_nav: TFunction = (name, options) => {
    return t("nav_menu." + name, options);
  };
  return (
    <>
      <SideNavMenuGroup title={t_nav("trips")}>
        <SideNavMenuItem
          text={t_nav("booked")}
          href="/host/trips/booked"
          icon={MenuIcons.Booked}
          notificationCount={bookedNotificationCount}
        />
        <SideNavMenuItem
          text={t_nav("history")}
          href="/host/trips/history"
          icon={MenuIcons.History}
          notificationCount={historyNotificationCount}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title={t_nav("vehicles")}>
        <SideNavMenuItem text={t_nav("listing")} href="/host/vehicles/listings" icon={MenuIcons.Listings} />
        <SideNavMenuItem
          text={t_nav("claims")}
          href="/host/claims"
          icon={MenuIcons.Claims}
          notificationCount={claimsNotificationCount}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title={t_nav("inbox")}>
        <SideNavMenuItem
          text={t_nav("messages")}
          href="/host/messages"
          icon={MenuIcons.Messages}
          notificationCount={messagesNotificationCount}
        />
        <SideNavMenuItem
          text={t_nav("notifications")}
          href="/host/notifications"
          icon={MenuIcons.Notifications}
          notificationCount={notificationsNotificationCount}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title={t_nav("more")}>
        <SideNavMenuItem
          text={t_nav("legal")}
          href="https://rentality.xyz/legalmatters"
          icon={MenuIcons.Legal}
          target="_blank"
        />
        <SideNavMenuItem
          text={t_nav("transaction_history")}
          href="/host/transaction_history"
          icon={MenuIcons.TransactionHistory}
        />
        <SideNavMenuItem text={t_nav("profile")} href="/host/profile" icon={MenuIcons.ProfileSettings} />
        {ready && authenticated ? (
          <SideNavMenuItem text={t_nav("logout")} href="/" onClick={logout} icon={MenuIcons.Logout} />
        ) : null}
      </SideNavMenuGroup>
    </>
  );
}

export default function HostSideNavMenu() {
  return (
    <BaseSideNavMenu accountType={"Host"}>
      <HostNavMenu />
    </BaseSideNavMenu>
  );
}

export function HostBurgerNavMenu() {
  return (
    <BaseBurgerNavMenu accountType={"Host"}>
      <HostNavMenu />
    </BaseBurgerNavMenu>
  );
}
