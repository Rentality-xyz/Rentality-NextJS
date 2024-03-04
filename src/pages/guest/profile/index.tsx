import GuestLayout from "@/components/guest/layout/guestLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import ProfileInfoPage from "@/components/profileInfo/profileInfoPage";
import useProfileSettings from "@/hooks/useProfileSettings";

export default function Profile() {
  const [isLoading, savedProfileSettings, saveProfileSettings] = useProfileSettings();

  return (
    <GuestLayout>
      <div className="flex flex-col">
        <PageTitle title="Profile settings" />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <ProfileInfoPage
            savedProfileSettings={savedProfileSettings}
            saveProfileSettings={saveProfileSettings}
            isHost={false}
          />
        )}
      </div>
    </GuestLayout>
  );
}
