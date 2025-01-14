import { memo } from "react";
import { ProfileSettings } from "@/hooks/useProfileSettings";
import UserCommonInformationForm from "./UserCommonInformationForm";
import UserDriverLicenseVerification from "./UserDriverLicenseVerification";

function UserProfileInfo({
  savedProfileSettings,
  saveProfileSettings,
}: {
  savedProfileSettings: ProfileSettings;
  saveProfileSettings: (newProfileSettings: ProfileSettings) => Promise<boolean>;
}) {
  return (
    <div className="my-1 flex flex-col gap-4 lg:my-8">
      <UserCommonInformationForm
        savedProfileSettings={savedProfileSettings}
        saveProfileSettings={saveProfileSettings}
      />
      <hr />
      <UserDriverLicenseVerification savedProfileSettings={savedProfileSettings} />
    </div>
  );
}

export default memo(UserProfileInfo);
