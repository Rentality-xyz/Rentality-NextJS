import { TFunction } from "@/utils/i18n";
import RntDriverLicenseVerified from "../common/rntDriverLicenseVerified";
import { ButtonMode, IdentityButton, useGateway } from "@civic/ethereum-gateway-react";
import { useEffect, useRef } from "react";
import { isEmpty } from "@/utils/string";

export default function KycVerification({ t }: { t: TFunction }) {
  const { pendingRequests } = useGateway();
  const isFetchingPiiData = useRef<boolean>(false);

  useEffect(() => {
    const getInfo = async () => {
      console.log(`KycVerification pendingRequests: ${JSON.stringify(pendingRequests)}`);

      if (!pendingRequests) return;
      if (isFetchingPiiData.current) return;
      if (isEmpty(pendingRequests.presentationRequestId)) return;

      isFetchingPiiData.current = true;
      try {
        var url = new URL(`/api/retrieveCivicData`, window.location.origin);
        url.searchParams.append("requestId", pendingRequests.presentationRequestId);

        console.log(`calling retrieveCivicData...`);

        const apiResponse = await fetch(url);

        if (!apiResponse.ok) {
          console.error(`getInfo fetch error: + ${apiResponse.statusText}`);
          return;
        }
      } finally {
        isFetchingPiiData.current = false;
      }
    };
    getInfo();
  }, [pendingRequests]);

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
