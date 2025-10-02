import { useTranslation } from "react-i18next";
import RntSuspense from "@/components/common/rntSuspense";
import RntButton from "@/components/common/rntButton";
import useCoinbaseVerification from "@/features/profile/hooks/useCoinbaseVerification";
import DotStatus from "@/components/dotStatus";

const COINBASE_VERIFICATION_LINK = "https://www.coinbase.com/setup/";

function UserCoinbaseVerification() {
  const { t } = useTranslation();
  const { isLoading, data: isVerified} = useCoinbaseVerification()

  const handleVerifyClick = () => {
    window.open(COINBASE_VERIFICATION_LINK);
  };

  return (
    <RntSuspense isLoading={isLoading}>
      <div className="pl-[16px] text-lg">
        <strong>{t("profile.kyc_onchain_verification")}</strong>
      </div>
      <DotStatus
        containerClassName=""
        color={isVerified ? "success" : "error"}
        text={isVerified ? t("profile.wallet_verified") : t("profile.wallet_not_verified")}
      />
      {!isVerified && (
        <RntButton className="lg:w-60" onClick={handleVerifyClick}>
          {t("profile.verify_by_coinbase")}
        </RntButton>
      )}
    </RntSuspense>
  );
}

export default UserCoinbaseVerification;
