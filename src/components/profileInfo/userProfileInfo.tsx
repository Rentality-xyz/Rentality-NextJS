import UserCommonInformationForm from "./UserCommonInformationForm";
import UserDriverLicenseVerification from "./UserDriverLicenseVerification";
import useFetchUserProfile from "@/features/profile/hooks/useFetchUserProfile";
import useSaveUserProfile from "@/features/profile/hooks/useSaveUserProfile";
import RntSuspense from "../common/rntSuspense";

function UserProfileInfo() {
  const { isLoading, data: userProfile } = useFetchUserProfile();
  const { isPending, mutateAsync: saveUserProfile } = useSaveUserProfile();

  return (
    <RntSuspense isLoading={isLoading}>
      <div className="my-1 flex flex-col gap-4 lg:my-8">
        <UserCommonInformationForm userProfile={userProfile} saveUserProfile={saveUserProfile} />
        <hr />
        <UserDriverLicenseVerification />
      </div>
    </RntSuspense>
  );
}

export default UserProfileInfo;
