import { Result } from "@/model/utils/result";
import { InvestmentInfo } from "../models/investmentInfo";
import StakeInAsset from "./StakeInAsset";
import ExpectCompletedTrips from "./ExpectCompletedTrips";
import ClaimEarnings from "./ClaimEarnings";
import InvestNow from "./InvestNow";

function GuestInvestBlock({
  investment,
  investmentAmount,
  handleInvest,
  isPendingInvesting,
  handleChangeInvestmentAmount,
  handleClaimIncome,
  t,
}: {
  investment: InvestmentInfo;
  investmentAmount: number;
  handleInvest: (amount: number, investId: number) => void;
  isPendingInvesting: boolean;
  handleChangeInvestmentAmount: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClaimIncome: (investId: number) => Promise<Result<boolean>>;
  t: (key: string) => string;
}) {
  return (
    <>
      <StakeInAsset myTokens={investment.myTokens} myInvestingSum={investment.myInvestingSum} t={t} />
      {!investment.listed && !investment.investment.inProgress ? (
        <ExpectCompletedTrips t={t} />
      ) : investment.myIncome > 0 ? (
        <ClaimEarnings
          myIncome={investment.myIncome}
          investmentId={investment.investmentId}
          handleClaimIncome={handleClaimIncome}
          t={t}
        />
      ) : investment.investment.inProgress ? (
        <InvestNow
          investmentId={investment.investmentId}
          investmentAmount={investmentAmount}
          handleInvest={handleInvest}
          isPendingInvesting={isPendingInvesting}
          handleChangeInvestmentAmount={handleChangeInvestmentAmount}
          t={t}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default GuestInvestBlock;
