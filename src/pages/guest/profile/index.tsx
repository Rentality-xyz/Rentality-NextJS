import Loading from "@/components/common/Loading";
import PageTitle from "@/components/pageTitle/pageTitle";
import UserProfileInfo from "@/components/profileInfo/userProfileInfo";
import AddFunds from "@/components/RnD/AddFunds";
import useProfileSettings from "@/hooks/useProfileSettings";
import { useTranslation } from "react-i18next";
import InvitationToConnect from "@/components/common/invitationToConnect";
import { useAuth } from "@/contexts/auth/authContext";

export default function Profile() {
  const [isLoading, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <>
      <PageTitle title={t("profile.title")} />
      {isLoading && <Loading />}
      {!isLoading && !isAuthenticated && <InvitationToConnect />}
      {!isLoading && isAuthenticated && (
        <>
          <UserProfileInfo
            savedProfileSettings={savedProfileSettings}
            saveProfileSettings={saveProfileSettings}
            isHost={false}
          />
          <AddFunds />
        </>
      )}
    </>
  );
}
