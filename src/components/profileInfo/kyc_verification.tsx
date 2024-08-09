import { TFunction } from "@/utils/i18n";
import RntDriverLicenseVerified from "../common/rntDriverLicenseVerified";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import CustomCivicDialog from "../kyc/customCivicDialog";
import RntButton from "../common/rntButton";

export default function KycVerification({ t }: { t: TFunction }) {
  const { showCustomDialog, hideDialogs } = useRntDialogs();

  function handleButtonClick() {
    showCustomDialog(<CustomCivicDialog handleCancelClick={hideDialogs} />);
  }

  return (
    <div id="driver_license_verification" className="mt-1.5">
      <p>{t("pass_license_verif")}</p>
      <div className="mt-4 flex items-center gap-2 md:gap-6">
        <RntButton type="button" onClick={handleButtonClick}>
          Get Pass
        </RntButton>
        <RntDriverLicenseVerified t={t} />
      </div>
    </div>
  );
}
