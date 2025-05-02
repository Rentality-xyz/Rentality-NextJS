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
    investment.listingDate === undefined;

  return (
    <div className="mx-auto mt-6 flex w-full flex-col items-center justify-center gap-4 2xl:mt-0">
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
