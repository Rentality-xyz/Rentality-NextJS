import { InvestmentInfo, InvestStatus } from "../models/investmentInfo";
import { getInvestListingStatus } from "../utils";

function Income({
  investment,
  walletAddress,
  isHost,
  t,
}: {
  investment: InvestmentInfo;
  walletAddress: string;
  isHost: boolean;
  t: (key: string) => string;
}) {

  const head = isHost ? t("invest.host_management") : t("invest.your_expected_earnings");
  const investStatus = getInvestListingStatus(investment, walletAddress, isHost);

  return investStatus === InvestStatus.ActuallyListed ? (
    <>
      <p className="text-xl font-semibold text-rentality-secondary max-2xl:mb-4">{t("invest.earnings_history")}</p>
      <div className="flex w-full flex-grow flex-col items-center justify-center">
        <p className="text-xl font-bold 2xl:text-2xl">${investment.totalEarnings}</p>
        <p className="2xl:text-lg">{t("invest.total_earnings")}</p>
        <div className="mx-auto my-2 h-0.5 w-[40%] translate-y-[-50%] bg-white sm:w-[70%]"></div>
        <p className="text-xl font-bold leading-none text-rentality-secondary 2xl:text-2xl">${investment.totalEarningsByUser}</p>
        <p className="text-center leading-snug 2xl:text-lg">{t("invest.your_received_earnings_part")}</p>
      </div>
    </>
  ) : (
    <>
      <span className="text-center text-lg text-rentality-secondary 2xl:text-xl fullHD:text-base">{head}</span>
      <span className="text-center text-lg 2xl:text-xl">
        {isHost ? investment.hostPart : investment.myPart}% {t("invest.from_each_trip")}
      </span>
    </>
  );
}

export default Income;
