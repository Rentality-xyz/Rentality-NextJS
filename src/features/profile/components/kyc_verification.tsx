import { TFunction } from "@/utils/i18n";
import { useRntDialogs, useRntSnackbars } from "@/contexts/rntDialogsContext";
import { GatewayStatus, useGateway } from "@civic/ethereum-gateway-react";
import { CivicProvider } from "@/contexts/web3/civicContext";
import CustomCivicDialog from "@/components/kyc/customCivicDialog";
import RntButton from "@/components/common/rntButton";
import DotStatus from "@/components/dotStatus";

export default function KycVerification({ t }: { t: TFunction }) {
  const { showCustomDialog, hideDialogs } = useRntDialogs();
  const { showError } = useRntSnackbars();

  function handleButtonClick() {
    showCustomDialog(<CustomCivicDialog showError={showError} handleCancelClick={hideDialogs} />);
  }

  return (
    <div id="driver_license_verification" className="mt-1.5">
      <div className="mt-4 flex items-center gap-2 md:gap-6">
        <RntButton type="button" onClick={handleButtonClick}>
          Get Pass
        </RntButton>
        <RntDriverLicenseVerified t={t} />
      </div>
    </div>
  );
}

function RntDriverLicenseVerified({ t }: { t: TFunction }) {
  return (
    <CivicProvider>
      <RntDriverLicenseVerifiedContent t={t} />
    </CivicProvider>
  );
}

function RntDriverLicenseVerifiedContent({ t }: { t: TFunction }) {
  const { gatewayStatus } = useGateway();
  const isActive = gatewayStatus === GatewayStatus.ACTIVE;

  return isActive ? (
    <DotStatus color="success" text={t("profile.license_verified")} />
  ) : (
    <DotStatus color="error" text={t("profile.license_not_verified")} />
  );
}
