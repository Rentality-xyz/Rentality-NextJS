import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import UserProfileInfo from "../components/UserProfileInfo";

function GuestProfilePageContent() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("profile.title")} />
      <UserProfileInfo />
    </>
  );
}

export default GuestProfilePageContent;
