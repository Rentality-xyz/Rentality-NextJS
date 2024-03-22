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

function HostNavMenu() {
  const { ready, authenticated, logout } = usePrivy();
  const { notifications } = useNotification();
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
  const messagesNotificationCount = notifications.filter(
    (n) => n.type === NotificationType.Message && n.datestamp > messagesLastVisitedDateTime
  ).length;
  const notificationsNotificationCount = notifications.filter(
    (n) => n.datestamp > notificationsLastVisitedDateTime
  ).length;

  return (
    <>
      <SideNavMenuGroup title="Trips">
        <SideNavMenuItem
          text="Booked"
          href="/host/trips/booked"
          icon={MenuIcons.Booked}
          notificationCount={bookedNotificationCount}
        />
        <SideNavMenuItem
          text="History"
          href="/host/trips/history"
          icon={MenuIcons.History}
          notificationCount={historyNotificationCount}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Vehicles">
        <SideNavMenuItem text="Listing" href="/host/vehicles/listings" icon={MenuIcons.Listings} />
        <SideNavMenuItem
          text="Claims"
          href="/host/claims"
          icon={MenuIcons.Claims}
          notificationCount={claimsNotificationCount}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Inbox">
        <SideNavMenuItem
          text="Messages"
          href="/host/messages"
          icon={MenuIcons.Messages}
          notificationCount={messagesNotificationCount}
        />
        <SideNavMenuItem
          text="Notifications"
          href="/host/notifications"
          icon={MenuIcons.Notifications}
          notificationCount={notificationsNotificationCount}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="More">
        <SideNavMenuItem
          text="Legal"
          href="https://rentality.xyz/legalmatters"
          icon={MenuIcons.Legal}
          target="_blank"
        />
        <SideNavMenuItem
          text="Transaction history"
          href="/host/transaction_history"
          icon={MenuIcons.TransactionHistory}
        />
        <SideNavMenuItem text="Profile settings" href="/host/profile" icon={MenuIcons.ProfileSettings} />
        {ready && authenticated ? (
          <SideNavMenuItem text="Logout" href="/" onClick={logout} icon={MenuIcons.Logout} />
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
