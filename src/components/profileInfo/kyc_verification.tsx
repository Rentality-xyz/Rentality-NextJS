import { TFunction } from "@/utils/i18n";
import RntDriverLicenseVerified from "../common/rntDriverLicenseVerified";
import { ButtonMode, IdentityButton } from "@civic/ethereum-gateway-react";

export default function KycVerification({ t }: { t: TFunction }) {
  return (
    <div id="driver_license_verification" className="mt-1.5">
      <p>{t("pass_license_verif")}</p>
      <div className="flex mt-4 items-center gap-2 md:gap-6">
        <IdentityButton mode={ButtonMode.LIGHT} className="civicButton" />
        <RntDriverLicenseVerified t={t} />
      </div>
    </div>
  );
}
