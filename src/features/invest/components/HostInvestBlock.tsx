import { Result } from "@/model/utils/result";
import { InvestmentInfo } from "../models/investmentInfo";
import RntButton from "@/components/common/rntButton";
import useChangeInvestmentListingStatus from "../hooks/useChangeInvestmentListingStatus";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";

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
  const { showInfo, showError, showSuccess } = useRntSnackbars();
  const { mutateAsync: handleChangeInvestmentListingStatus, isPending } = useChangeInvestmentListingStatus();

  async function handleChangeListedStatus(investmentId: number) {
    showInfo(t("common.info.sign"));

    const result = await handleChangeInvestmentListingStatus({ investId: investmentId });
    if (result.ok) {
      showSuccess(t("common.info.success"));
    } else {
      showError(t("common.info.error"));
    }
  }

  const isReadyToClaim =
    isCreator &&
    (investment.payedInCurrency >= investment.investment.priceInCurrency || !investment.investment.inProgress) &&
    investment.listingDate.getTime() > 0;

  return (
    <div className="mx-auto flex h-14 w-full items-center justify-center marker:mt-6">
      {isReadyToClaim && (
        <RntButton className="h-14" onClick={() => handleStartHosting(investment.investmentId)}>
          {t("invest.btn_start_hosting")}
        </RntButton>
      )}
      <RntButton
        className="h-14"
        onClick={() => handleChangeListedStatus(investment.investmentId)}
        disabled={isPending}
      >
        {investment.listed ? t("invest.unlist_investment") : t("invest.list_investment")}
      </RntButton>
    </div>
  );
}

export default HostInvestBlock;
