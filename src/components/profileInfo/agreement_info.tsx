import { useEffect, useRef, useState } from "react";
import { CheckboxLight } from "@/components/common/rntCheckbox";
import RntButton from "@/components/common/rntButton";
import { TFunction } from "@/utils/i18n";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isEmpty } from "@/utils/string";
import DotStatus from "./dotStatus";
import { signMessage } from "@/utils/ether";
import { DEFAULT_AGREEMENT_MESSAGE } from "@/utils/constants";
import { verifyMessage } from "ethers";

export default function AgreementInfo({
  signature,
  onSign,
  t,
}: {
  signature: string;
  onSign: (signature: string) => void;
  t: TFunction;
}) {
  const [isTerms, setIsTerms] = useState(false);
  const [isCancellation, setIsCancellation] = useState(false);
  const [isProhibited, setIsProhibited] = useState(false);
  const [isPrivacy, setIsPrivacy] = useState(false);
  const [tcSignature, setTcSignature] = useState("");
  const ethereumInfo = useEthereum();

  const isInited = useRef(false);

  useEffect(() => {
    const setInitValue = async () => {
      if (!ethereumInfo) return;
      if (isInited.current) return;

      const address = await ethereumInfo.signer.getAddress();
      const verifyAddress = verifyMessage(DEFAULT_AGREEMENT_MESSAGE, signature);
      const isSignatureCorrect = !isEmpty(signature) && signature !== "0x" && verifyAddress === address;

      isInited.current = true;
      setIsTerms((prev) => prev || isSignatureCorrect);
      setIsCancellation((prev) => prev || isSignatureCorrect);
      setIsProhibited((prev) => prev || isSignatureCorrect);
      setIsPrivacy((prev) => prev || isSignatureCorrect);
      if (isSignatureCorrect) {
        setTcSignature(signature);
      }
    };

    setInitValue();
  }, [ethereumInfo, signature]);

  const handleConfirm = async () => {
    if (!isTerms || !isCancellation || !isProhibited || !isPrivacy) return;
    if (!ethereumInfo) return;

    const signature = await signMessage(ethereumInfo.signer, DEFAULT_AGREEMENT_MESSAGE);

    setTcSignature(signature);
    onSign(signature);
  };

  return (
    <section>
      <p className="mt-8 w-full md:w-3/4 xl:w-3/5 2xl:w-1/3">{t("agreement_info")}</p>
      <CheckboxLight
        className="ml-4 mt-4 underline"
        label={t("tc_title")}
        checked={isTerms}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/terms", "_blank");
          setIsTerms(true);
        }}
      />
      <CheckboxLight
        className="ml-4 mt-2 underline"
        label={t("cancellation_title")}
        checked={isCancellation}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/cancellation", "_blank");
          setIsCancellation(true);
        }}
      />
      <CheckboxLight
        className="ml-4 mt-2 underline"
        label={t("prohibited_title")}
        checked={isProhibited}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/prohibiteduses", "_blank");
          setIsProhibited(true);
        }}
      />
      <CheckboxLight
        className="ml-4 mt-2 underline"
        label={t("privacy_title")}
        checked={isPrivacy}
        onChange={() => {
          window.open("https://rentality.xyz/legalmatters/privacy", "_blank");
          setIsPrivacy(true);
        }}
      />
      <p className="mt-8">{t("read_agree")}</p>
      <div className="mt-4 flex items-center">
        <RntButton type="button" onClick={handleConfirm} disabled={!isEmpty(tcSignature)}>
          {t("confirm")}
        </RntButton>
        <div className="ml-2 md:ml-6">
          {!isEmpty(tcSignature) ? (
            <DotStatus color="success" text={t("confirmed")} />
          ) : (
            <DotStatus color="error" text={t("not_confirmed")} />
          )}
        </div>
      </div>
    </section>
  );
}
