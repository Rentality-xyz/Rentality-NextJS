import Loading from "@/components/common/Loading";
import NotificationPage from "@/components/notification/notificationPage";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useNotification } from "@/contexts/notification/notificationContext";
import { useTranslation } from "react-i18next";
import InvitationToConnect from "@/components/common/invitationToConnect";
import { useAuth } from "@/contexts/auth/authContext";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import React from "react";

export default function Notifications() {
  const { isLoading, notifications } = useNotification();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("notifications.title")} />
      <CheckingLoadingAuth>
        {isLoading && <Loading />}
        {!isLoading && <NotificationPage notifications={notifications} />}
      </CheckingLoadingAuth>
    </>
  );
}
