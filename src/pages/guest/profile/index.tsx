import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import UserProfileInfo from "@/components/profileInfo/userProfileInfo";
import ProfileRnD from "@/components/RnD/profileRnD";
import useProfileSettings from "@/hooks/useProfileSettings";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const [isLoading, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("profile.title")} />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            {t("common.info.loading")}
          </div>
        ) : (
          <>
            <UserProfileInfo
              savedProfileSettings={savedProfileSettings}
              saveProfileSettings={saveProfileSettings}
              isHost={false}
              t={t}
            />
            <ProfileRnD />
          </>
        )}
      </div>
    </Layout>
  );
}
