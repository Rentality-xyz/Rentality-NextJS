import PageTitle from "@/components/pageTitle/pageTitle";
import UserProfileInfo from "@/components/profileInfo/userProfileInfo";
import useProfileSettings from "@/hooks/useProfileSettings";
import { useTranslation } from "react-i18next";
import RntSuspense from "@/components/common/rntSuspense";

function Profile() {
  const [isLoading, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("profile.title")} />
      <RntSuspense isLoading={isLoading}>
        <UserProfileInfo savedProfileSettings={savedProfileSettings} saveProfileSettings={saveProfileSettings} />
      </RntSuspense>
    </>
  );
}

export default Profile;
