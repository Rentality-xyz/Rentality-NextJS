import Loading from "@/components/common/Loading";
import PageTitle from "@/components/pageTitle/pageTitle";
import UserProfileInfo from "@/components/profileInfo/userProfileInfo";
import AddFunds from "@/components/RnD/AddFunds";
import useProfileSettings from "@/hooks/useProfileSettings";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const [isLoading, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("profile.title")} />
      {isLoading && <Loading />}
      {!isLoading && (
        <>
          <UserProfileInfo
            savedProfileSettings={savedProfileSettings}
            saveProfileSettings={saveProfileSettings}
            isHost={false}
            t={t}
          />
          <AddFunds />
        </>
      )}
    </>
  );
}
