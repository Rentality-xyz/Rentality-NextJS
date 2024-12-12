import { UserInsurance } from "@/components/guest/UserInsurance";
import PageTitle from "@/components/pageTitle/pageTitle";
import UserProfileInfo from "@/components/profileInfo/userProfileInfo";
import AddFunds from "@/components/RnD/AddFunds";
import useProfileSettings from "@/hooks/useProfileSettings";
import { useTranslation } from "react-i18next";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";

function Profile() {
  const [isLoading, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("profile.title")} />
      <CheckingLoadingAuth>
        <RntSuspense isLoading={isLoading}>
          <UserProfileInfo
            savedProfileSettings={savedProfileSettings}
            saveProfileSettings={saveProfileSettings}
            isHost={false}
          />
          <hr />
          <UserInsurance />
          <hr />
          <AddFunds />
        </RntSuspense>
      </CheckingLoadingAuth>
    </>
  );
}

export default Profile;
