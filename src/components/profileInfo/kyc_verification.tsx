import { ButtonMode, GatewayStatus, IdentityButton, useGateway as useCivic } from "@civic/ethereum-gateway-react";
import { TFunction } from "@/utils/i18n";
import DotStatus from "./dotStatus";

export default function KycVerification({ t }: { t: TFunction }) {
  const { gatewayStatus } = useCivic();

  return (
    <div id="driver_license_verification" className="mt-1.5">
      <p>{t("pass_license_varif")}</p>
      <div className="flex mt-4 items-center gap-2 md:gap-6">
        <IdentityButton mode={ButtonMode.LIGHT} className="civicButton" />
        {gatewayStatus === GatewayStatus.ACTIVE ? (
          <DotStatus color="success" text={t("license_verified")} />
        ) : (
          <DotStatus color="error" text={t("license_not_verified")} />
        )}
      </div>
    </div>
  );
}
