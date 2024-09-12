import Loading from "@/components/common/Loading";
import NotificationPage from "@/components/notification/notificationPage";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useNotification } from "@/contexts/notification/notificationContext";
import { useTranslation } from "react-i18next";

export default function Notifications() {
  const { isLoading, notifications } = useNotification();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("notifications.title")} />
      {isLoading && <Loading />}
      {!isLoading && <NotificationPage notifications={notifications} />}
    </>
  );
}
