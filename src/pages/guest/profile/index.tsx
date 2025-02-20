import PageTitle from "@/components/pageTitle/pageTitle";
import UserProfileInfo from "@/components/profileInfo/userProfileInfo";
import { useTranslation } from "react-i18next";

function Profile() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("profile.title")} />
      <UserProfileInfo />
    </>
  );
}

export default Profile;
