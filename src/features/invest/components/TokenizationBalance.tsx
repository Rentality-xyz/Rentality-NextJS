import { InvestmentInfo, InvestStatus } from "../models/investmentInfo";
import { getInvestListingStatus } from "../utils";

function TokenizationBalance({
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
  const investStatus = getInvestListingStatus(investment, walletAddress, isHost);

  return investStatus === InvestStatus.WaitingFullTokenization ? (
    <>
      <p className="text-xl font-bold leading-none text-rentality-secondary 2xl:text-2xl">
        ETH: {(investment.investment.priceInCurrency - investment.payedInCurrency)}
      </p>
      <p className="leading-snug text-rentality-secondary 2xl:text-lg">{t("invest.balance_raised")}</p>
    </>
  ) : (
    <>
      <p className="leading-snug text-rentality-secondary 2xl:text-lg">{t("invest.fully_tokenized")}</p>
      {isHost && (
        <p className="mt-4 leading-snug text-[#FFFFFF70]">
          {t("invest.tokens_held_by_investors")
            .replace("{tokens}", String(investment.totalTokens))
            .replace("{investors}", String(investment.totalHolders))}
        </p>
      )}
    </>
  );
}

export default TokenizationBalance;
