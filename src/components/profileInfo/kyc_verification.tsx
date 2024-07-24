import { TFunction } from "@/utils/i18n";
import RntDriverLicenseVerified from "../common/rntDriverLicenseVerified";
import { ButtonMode, IdentityButton, useGateway } from "@civic/ethereum-gateway-react";
import { useEffect, useRef } from "react";
import { isEmpty } from "@/utils/string";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import RntInputMultiline from "../common/rntInputMultiline";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";

export default function KycVerification({ t }: { t: TFunction }) {
  const { pendingRequests } = useGateway();
  const { showCustomDialog, hideDialogs } = useRntDialogs();
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

        console.log(`url: ${url}`);

        const apiResponse = await fetch(url);

        if (!apiResponse.ok) {
          console.error(`getInfo fetch error: + ${apiResponse.statusText}`);
          return;
        }

        const apiJson = await apiResponse.json();
        console.log(`apiJson: ${JSON.stringify(apiJson)}`);

        showCustomDialog(
          <div className="grid grid-cols-[auto_1fr] gap-2 ">
            <em>id:</em>
            <span>{apiJson.id}</span>
            <em>type:</em>
            <span>{apiJson.type}</span>
            <em>status:</em>
            <span>{apiJson.status}</span>
            <em className="text-2xl col-span-2">Verified Information:</em>
            <em>issueCountry:</em>
            <span>{apiJson.verifiedInformation.issueCountry}</span>
            <em>name:</em>
            <span>{apiJson.verifiedInformation.name}</span>
            <em>email:</em>
            <span>{apiJson.verifiedInformation.email}</span>
            <em>dateOfBirth:</em>
            <span>{apiJson.verifiedInformation.dateOfBirth}</span>
            <em>dateOfExpiry:</em>
            <span>{apiJson.verifiedInformation.dateOfExpiry}</span>
            <em>documentType:</em>
            <span>{apiJson.verifiedInformation.documentType}</span>
            <em>documentNumber:</em>
            <span>{apiJson.verifiedInformation.documentNumber}</span>
            <em>address:</em>
            <span>{apiJson.verifiedInformation.address}</span>
            <em>accountId:</em>
            <span className="truncate">{apiJson.verifiedInformation.accountId}</span>
            <em className="text-2xl col-span-2">Links:</em>
            {(apiJson.links as any[]).map((i, index) => {
              return (
                <div key={i.rel as string} className="col-span-2 flex flex-col">
                  <div>{`${index + 1}) ${i.rel}`}</div>
                  <div>{i.href}</div>
                </div>
              );
            })}
            <RntButton className="col-span-2 mt-8 mx-auto" onClick={hideDialogs}>
              Close
            </RntButton>
          </div>
        );
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
