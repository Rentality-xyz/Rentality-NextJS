import { ButtonMode, GatewayStatus, IdentityButton, useGateway as useCivic } from "@civic/ethereum-gateway-react";
import { useState } from "react";
import { CheckboxLight } from "@/components/common/checkbox";
import RntButton from "@/components/common/rntButton";
import { TFunction } from "@/utils/i18n";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isEmpty } from "@/utils/string";
import { keccak256 } from "ethers";

const hasSignature = (signature: string) => {
  return !isEmpty(signature) && signature !== "0x";
};

export default function DriverLicenseVerified({
  signature,
  onSign,
  t,
}: {
  signature: string;
  onSign: (signature: string) => void;
  t: TFunction;
}) {
  const { gatewayStatus } = useCivic();
  const userHasSignature = hasSignature(signature);
  const [isTerms, setIsTerms] = useState(userHasSignature);
  const [isCancellation, setIsCancellation] = useState(userHasSignature);
  const [isProhibited, setIsProhibited] = useState(userHasSignature);
  const [isPrivacy, setIsPrivacy] = useState(userHasSignature);
  const [tcSignature, setTcSignature] = useState(signature);
  const ethereumInfo = useEthereum();

  const handleConfirm = async () => {
    if (!isTerms || !isCancellation || !isProhibited || !isPrivacy) return;
    if (!ethereumInfo) return;

    const messageToSign =
      "I have read and I agree with Terms of service, Cancellation policy, Prohibited uses and Privacy policy of Rentality.";
    const messageHash = keccak256(Buffer.from(messageToSign));
    const signature = await ethereumInfo.signer.signMessage(messageHash);
    setTcSignature(signature);
    onSign(signature);
  };

  return (
    <div id="driver_license_verification" className="mt-1.5">
      <p>{t("pass_license_varif")}</p>
      <div className="flex mt-4 items-center gap-2 md:gap-6">
        <IdentityButton mode={ButtonMode.LIGHT} className="civicButton" />
        {gatewayStatus === GatewayStatus.ACTIVE ? (
          <GetVerifiedDriverLicense text={t("license_verified")} />
        ) : (
          <GetNotVerifiedDriverLicense text={t("license_not_verified")} />
        )}
      </div>
      <p className="mt-8 w-full md:w-3/4 xl:w-3/5 2xl:w-1/3">{t("agreement_info")}</p>
      <CheckboxLight
        className="ml-4 mt-4"
        title={t("tc_title")}
        value={isTerms}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/terms", "_blank");
          setIsTerms(true);
        }}
      />
      <CheckboxLight
        className="ml-4 mt-2"
        title={t("cancellation_title")}
        value={isCancellation}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/cancellation", "_blank");
          setIsCancellation(true);
        }}
      />
      <CheckboxLight
        className="ml-4 mt-2"
        title={t("prohibited_title")}
        value={isProhibited}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/prohibiteduses", "_blank");
          setIsProhibited(true);
        }}
      />
      <CheckboxLight
        className="ml-4 mt-2"
        title={t("privacy_title")}
        value={isPrivacy}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/privacy", "_blank");
          setIsPrivacy(true);
        }}
      />
      <p className="mt-8">{t("read_agree")}</p>
      <div className="flex mt-4 items-center">
        <RntButton type="button" onClick={handleConfirm} disabled={hasSignature(tcSignature)}>
          {t("confirm")}
        </RntButton>
        <div className="ml-2 md:ml-6">
          {hasSignature(tcSignature) ? (
            <GetConfirm text={t("confirmed")} />
          ) : (
            <GetNotConfirm text={t("not_confirmed")} />
          )}
        </div>
      </div>
    </div>
  );
}

function GetNotVerifiedDriverLicense({ text }: { text: string }) {
  return (
    <div className="flex items-center">
      <span className="w-4 h-4 bg-[#DB001A] rounded-full inline-block pr-4"></span>
      <span className="ml-2">{text}</span>
    </div>
  );
}

function GetVerifiedDriverLicense({ text }: { text: string }) {
  return (
    <div className="flex items-center">
      <span className="w-4 h-4 bg-[#2EB100] rounded-full inline-block pr-4"></span>
      <span className="ml-2">{text}</span>
    </div>
  );
}

function GetNotConfirm({ text }: { text: string }) {
  return (
    <div className="flex items-center">
      <span className="w-4 h-4 bg-[#DB001A] rounded-full inline-block pr-4"></span>
      <span className="ml-2">{text}</span>
    </div>
  );
}

function GetConfirm({ text }: { text: string }) {
  return (
    <div className="flex items-center">
      <span className="w-4 h-4 bg-[#2EB100] rounded-full inline-block pr-4"></span>
      <span className="ml-2">{text}</span>
    </div>
  );
}
