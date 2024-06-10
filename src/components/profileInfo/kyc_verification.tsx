import { TFunction } from "@/utils/i18n";
import RntButton from "../common/rntButton";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import RntDriverLicenseVerified from "../common/rntDriverLicenseVerified";
import CustomCivicDialog from "../kyc/customCivicDialog";

export default function KycVerification({ t }: { t: TFunction }) {
  const { showCustomDialog, hideDialogs } = useRntDialogs();

  function handleButtonClick() {
    showCustomDialog(<CustomCivicDialog handleCancelClick={hideDialogs} />);
  }

  return (
    <div id="driver_license_verification" className="mt-1.5">
      <p>{t("pass_license_verif")}</p>
      <div className="flex mt-4 items-center gap-2 md:gap-6">
        <RntButton type="button" onClick={handleButtonClick}>
          Get Pass
        </RntButton>
        <RntDriverLicenseVerified t={t} />
      </div>
    </div>
  );
}
