import { ButtonMode, GatewayStatus, IdentityButton, useGateway as useCivic } from "@civic/ethereum-gateway-react";
import { useState } from "react";
import { CheckboxLight } from "@/components/common/checkbox";
import RntButton from "@/components/common/rntButton";

export default function DriverLicenseVerified({
  isConfirmed,
  onConfirm,
}: {
  isConfirmed: boolean;
  onConfirm: (isConfirmed: boolean) => void;
}) {
  const { gatewayStatus } = useCivic();
  const [isTerms, setIsTerms] = useState(isConfirmed);
  const [isCancellation, setIsCancellation] = useState(isConfirmed);
  const [isProhibited, setIsProhibited] = useState(isConfirmed);
  const [isPrivacy, setIsPrivacy] = useState(isConfirmed);
  const [isConfirm, setIsConfirm] = useState(isConfirmed);

  const handleConfirm = () => {
    if (!isTerms || !isCancellation || !isProhibited || !isPrivacy) return;

    setIsConfirm(true);
    onConfirm(true);
  };

  return (
    <div id="driver_license_verification" className="mt-1.5">
      <p>Please pass driver license verification</p>
      <div className="flex mt-4 items-center gap-2 md:gap-6">
        <IdentityButton mode={ButtonMode.LIGHT} className="civicButton" />
        {gatewayStatus === GatewayStatus.ACTIVE ? <GetVerifiedDriverLicense /> : <GetNotVerifiedDriverLicense />}
      </div>
      <p className="mt-8 w-full md:w-3/4 xl:w-3/5 2xl:w-1/3">
        For booking or listing a vehicle, please agree to the following documents by clicking on them below and read
        each one
      </p>
      <CheckboxLight
        className="ml-4 mt-4"
        title="Terms of service"
        value={isTerms}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/terms", "_blank");
          setIsTerms(true);
        }}
      />
      <CheckboxLight
        className="ml-4 mt-2"
        title="Cancellation policy"
        value={isCancellation}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/cancellation", "_blank");
          setIsCancellation(true);
        }}
      />
      <CheckboxLight
        className="ml-4 mt-2"
        title="Prohibited uses"
        value={isProhibited}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/prohibiteduses", "_blank");
          setIsProhibited(true);
        }}
      />
      <CheckboxLight
        className="ml-4 mt-2"
        title="Privacy policy"
        value={isPrivacy}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/privacy", "_blank");
          setIsPrivacy(true);
        }}
      />
      <p className="mt-8">I have read and i agree</p>
      <div className="flex mt-4 items-center">
        <RntButton type="button" onClick={handleConfirm} disabled={isConfirm}>
          Confirm
        </RntButton>
        <div className="ml-2 md:ml-6">{isConfirm ? <GetConfirm /> : <GetNotConfirm />}</div>
      </div>
    </div>
  );
}

function GetNotVerifiedDriverLicense() {
  return (
    <div className="flex items-center">
      <span className="w-4 h-4 bg-[#DB001A] rounded-full inline-block pr-4"></span>
      <span className="ml-2">Your driver license not verified</span>
    </div>
  );
}

function GetVerifiedDriverLicense() {
  return (
    <div className="flex items-center">
      <span className="w-4 h-4 bg-[#2EB100] rounded-full inline-block pr-4"></span>
      <span className="ml-2">You driver license verified</span>
    </div>
  );
}

function GetNotConfirm() {
  return (
    <div className="flex items-center">
      <span className="w-4 h-4 bg-[#DB001A] rounded-full inline-block pr-4"></span>
      <span className="ml-2">You did not confirm</span>
    </div>
  );
}

function GetConfirm() {
  return (
    <div className="flex items-center">
      <span className="w-4 h-4 bg-[#2EB100] rounded-full inline-block pr-4"></span>
      <span className="ml-2">You confirmed</span>
    </div>
  );
}
