import RntButton from "@/components/common/rntButton";
import { Result } from "@/model/utils/result";

function ClaimEarnings({
  myIncome,
  investmentId,
  handleClaimIncome,
  t,
}: {
  myIncome: number;
  investmentId: number;
  handleClaimIncome: (investId: number) => Promise<Result<boolean>>;
  t: (key: string) => string;
}) {
  return (
    <RntButton
      className="mx-auto mt-6 flex h-14 w-full items-center justify-center"
      onClick={() => handleClaimIncome(investmentId)}
    >
      {t("invest.btn_claim_earnings")} ${myIncome.toFixed(2)}
    </RntButton>
  );
}

export default ClaimEarnings;
