import RntDialogs from "@/components/common/rntDialogs";
import GuestLayout from "@/components/guest/layout/guestLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import ProfileInfoPage from "@/components/profileInfo/profileInfoPage";
import useProfileSettings from "@/hooks/useProfileSettings";
import useRntDialogs from "@/hooks/useRntDialogs";

export default function Profile() {
  const [dataFetched, savedProfileSettings, saveProfileSettings] =
    useProfileSettings();
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] =
    useRntDialogs();

  return (
    <GuestLayout>
      <div className="flex flex-col">
        <PageTitle title="Profile settings" />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <ProfileInfoPage
            savedProfileSettings={savedProfileSettings}
            saveProfileSettings={saveProfileSettings}
            showInfo={showInfo}
            showError={showError}
            hideSnackbar={hideSnackbar}
          />
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </GuestLayout>
  );
}
