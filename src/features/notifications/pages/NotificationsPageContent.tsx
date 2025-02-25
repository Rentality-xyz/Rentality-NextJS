import PageTitle from "@/components/pageTitle/pageTitle";
import { useNotification } from "@/features/notifications/contexts/notificationContext";
import { useTranslation } from "react-i18next";
import RntSuspense from "@/components/common/rntSuspense";
import Notification from "../components/Notification";

function NotificationsPageContent() {
  const { isLoading, notifications } = useNotification();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("notifications.title")} />
      <RntSuspense isLoading={isLoading}>
        <div className="mt-5 flex flex-row gap-4">
          <div className="flex w-full flex-col gap-2 lg:w-full lg:pr-8">
            {notifications.map((notificationInfo, index) => {
              return (
                <Notification
                  key={index}
                  title={notificationInfo.title}
                  datetime={notificationInfo.datestamp}
                  message={notificationInfo.message}
                />
              );
            })}
          </div>
        </div>
      </RntSuspense>
    </>
  );
}

export default NotificationsPageContent;
