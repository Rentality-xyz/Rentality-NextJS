import { Result } from "@/model/utils/result";
import { InvestmentInfo } from "../models/investmentInfo";
import RntButton from "@/components/common/rntButton";

function HostInvestBlock({
  isCreator,
  investment,
  handleStartHosting,
  t,
}: {
  isCreator: boolean;
  investment: InvestmentInfo;
  handleStartHosting: (investId: number) => Promise<Result<boolean>>;
  t: (key: string) => string;
}) {
  const isReadyToClaim = (): boolean => {
    return (
      isCreator &&
      (investment.payedInUsd >= investment.investment.priceInUsd || !investment.investment.inProgress) &&
      !investment.listed
    );
  };

  return isReadyToClaim() ? (
    <RntButton
      className="mx-auto mt-6 flex h-14 w-full items-center justify-center"
      onClick={() => handleStartHosting(investment.investmentId)}
    >
      {t("invest.btn_start_hosting")}
    </RntButton>
  ) : (
    <div className="mt-6 flex h-14 w-full"></div>
  );
}

export default HostInvestBlock;
