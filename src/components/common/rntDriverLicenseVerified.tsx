import { GatewayStatus, useGateway } from "@civic/ethereum-gateway-react";
import { TFunction } from "@/utils/i18n";
import DotStatus from "../profileInfo/dotStatus";

export default function RntDriverLicenseVerified({ t }: { t: TFunction }) {
  const { gatewayStatus } = useGateway();
  const isActive = gatewayStatus === GatewayStatus.ACTIVE;

  return isActive ? (
    <DotStatus color="success" text={t("license_verified")} />
  ) : (
    <DotStatus color="error" text={t("license_not_verified")} />
  );
}
