import BaseBurgerNavMenu from "./baseBurgerNavMenu";
import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import MenuIcons, { getImageForMenu } from "@/components/sideNavMenu/menuIcons";
import { useNotification } from "@/contexts/notification/notificationContext";
import usePageLastVisit from "@/hooks/usePageLastVisit";
import { NotificationType } from "@/model/NotificationInfo";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import { useChat } from "@/contexts/chat/firebase/chatContext";
import { useAuth } from "@/contexts/auth/authContext";
import * as React from "react";

function GuestNavMenu() {
  const { isAuthenticated, logout } = useAuth();
  const { notifications } = useNotification();
  const { chatInfos } = useChat();
  const { getPageLastVisitedDateTime } = usePageLastVisit();
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
  const { t } = useTranslation();
  const t_nav: TFunction = (name, options) => {
    return t("nav_menu." + name, options);
  };
  return (
    <>
      <SideNavMenuGroup title={t_nav("search")} href="/guest/search" icon={MenuIcons.Search} />
      <SideNavMenuGroup title={t_nav("trips")}>
        <SideNavMenuItem
          text={t_nav("booked")}
          href="/guest/trips/booked"
          icon={MenuIcons.Booked}
          notificationCount={bookedNotificationCount}
        />
        <SideNavMenuItem
          text={t_nav("history")}
          href="/guest/trips/history"
          icon={MenuIcons.History}
          notificationCount={historyNotificationCount}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title={t_nav("inbox")}>
        <SideNavMenuItem
          text={t_nav("messages")}
          href="/guest/messages"
          icon={MenuIcons.Messages}
          notificationCount={messagesNotificationCount}
        />
        <SideNavMenuItem
          text={t_nav("notifications")}
          href="/guest/notifications"
          icon={MenuIcons.Notifications}
          notificationCount={notificationsNotificationCount}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title={t_nav("more")}>
        <SideNavMenuItem
          text={t_nav("claims")}
          href="/guest/claims"
          icon={MenuIcons.Claims}
          notificationCount={claimsNotificationCount}
        />
        <SideNavMenuItem text={t_nav("legal")} href="/guest/legal" icon={MenuIcons.Legal} />
        <SideNavMenuItem
          text={t_nav("transaction_history")}
          href="/guest/transaction_history"
          icon={MenuIcons.TransactionHistory}
        />
        <SideNavMenuItem text={t_nav("profile")} href="/guest/profile" icon={MenuIcons.ProfileSettings} />
        {isAuthenticated ? (
          <SideNavMenuItem text={t_nav("logout")} href="/" onClick={logout} icon={MenuIcons.Logout} />
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
