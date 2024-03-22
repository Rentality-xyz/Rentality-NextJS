import { usePrivy } from "@privy-io/react-auth";
import BaseBurgerNavMenu from "./baseBurgerNavMenu";
import BaseSideNavMenu from "./baseSideNavMenu";
import SideNavMenuGroup from "./sideNavMenuGroup";
import SideNavMenuItem from "./sideNavMenuItem";
import MenuIcons from "@/components/sideNavMenu/menuIcons";
import { useNotification } from "@/contexts/notification/notificationContext";
import usePageLastVisit from "@/hooks/usePageLastVisit";
import { NotificationType } from "@/model/NotificationInfo";

function GuestNavMenu() {
  const { ready, authenticated, logout } = usePrivy();
  const { notifications } = useNotification();
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
  const messagesNotificationCount = notifications.filter(
    (n) => n.type === NotificationType.Message && n.datestamp > messagesLastVisitedDateTime
  ).length;
  const notificationsNotificationCount = notifications.filter(
    (n) => n.datestamp > notificationsLastVisitedDateTime
  ).length;

  return (
    <>
      <SideNavMenuGroup title="Search" href="/guest/search" />
      <SideNavMenuGroup title="Trips">
        <SideNavMenuItem
          text="Booked"
          href="/guest/trips/booked"
          icon={MenuIcons.Booked}
          notificationCount={bookedNotificationCount}
        />
        <SideNavMenuItem
          text="History"
          href="/guest/trips/history"
          icon={MenuIcons.History}
          notificationCount={historyNotificationCount}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="Inbox">
        <SideNavMenuItem
          text="Messages"
          href="/guest/messages"
          icon={MenuIcons.Messages}
          notificationCount={messagesNotificationCount}
        />
        <SideNavMenuItem
          text="Notifications"
          href="/guest/notifications"
          icon={MenuIcons.Notifications}
          notificationCount={notificationsNotificationCount}
        />
      </SideNavMenuGroup>
      <SideNavMenuGroup title="More">
        <SideNavMenuItem
          text="Claims"
          href="/guest/claims"
          icon={MenuIcons.Claims}
          notificationCount={claimsNotificationCount}
        />
        <SideNavMenuItem
          text="Legal"
          href="https://rentality.xyz/legalmatters"
          icon={MenuIcons.Legal}
          target="_blank"
        />
        <SideNavMenuItem
          text="Transaction history"
          href="/guest/transaction_history"
          icon={MenuIcons.TransactionHistory}
        />
        <SideNavMenuItem text="Profile settings" href="/guest/profile" icon={MenuIcons.ProfileSettings} />
        {ready && authenticated ? (
          <SideNavMenuItem text="Logout" href="/" onClick={logout} icon={MenuIcons.Logout} />
        ) : null}
      </SideNavMenuGroup>
    </>
  );
}

export default function GuestSideNavMenu() {
  return (
    <BaseSideNavMenu accountType={"Guest"}>
      <GuestNavMenu />
    </BaseSideNavMenu>
  );
}

export function GuestBurgerNavMenu() {
  return (
    <BaseBurgerNavMenu accountType={"Guest"}>
      <GuestNavMenu />
    </BaseBurgerNavMenu>
  );
}
