import Layout from "@/components/layout/layout";
import NotificationPage from "@/components/notification/notificationPage";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useNotification } from "@/contexts/notification/notificationContext";
import {useTranslation} from "react-i18next";

export default function Notifications() {
  const { isLoading, notifications } = useNotification();
    const {t} = useTranslation()

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t('notifications.title')} />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">{t("common.info.loading")}</div>
        ) : (
          <NotificationPage notifications={notifications} />
        )}
      </div>
    </Layout>
  );
}
