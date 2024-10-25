import Loading from "@/components/common/Loading";
import NotificationPage from "@/components/notification/notificationPage";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useNotification } from "@/contexts/notification/notificationContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth/authContext";
import InvitationToConnect from "@/components/common/invitationToConnect";

export default function Notifications() {
  const { isLoading, notifications } = useNotification();
  const { t } = useTranslation();
  const { isLoadingAuth, isAuthenticated } = useAuth();

  return (
    <>
      <PageTitle title={t("notifications.title")} />
      {isLoadingAuth && <Loading />}
      {!isLoadingAuth && !isAuthenticated && <InvitationToConnect />}
      {!isLoading && isAuthenticated && <NotificationPage notifications={notifications} />}
    </>
  );
}
