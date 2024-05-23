import { GatewayStatus, useGateway } from "@civic/ethereum-gateway-react";
import { TFunction } from "@/utils/i18n";

export default function RntDriverLicenseVerified({
  t,
}: {
  t: TFunction;
}) {
	const { gatewayStatus } = useGateway();
	const isActive = gatewayStatus === GatewayStatus.ACTIVE;
	
	return (
		<div className="flex items-center">
			<span className={"w-4 h-4 rounded-full inline-block pr-4 " + (isActive ? "bg-[#2EB100]" : "bg-[#DB001A]")}></span>
			<span className="ml-2">{isActive ? t("profile.license_verified") : t("profile.license_not_verified")}</span>
		</div>	
	)
}
