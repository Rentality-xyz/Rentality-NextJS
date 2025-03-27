import RntButton from "@/components/common/rntButton";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import { useEffect, useState } from "react";

function InvestNow({
  investmentId,
  investmentAmount,
  handleInvest,
  isPendingInvesting,
  handleChangeInvestmentAmount,
  t,
}: {
  investmentId: number;
  investmentAmount: number;
  handleInvest: (amount: number, investId: number) => void;
  isPendingInvesting: boolean;
  handleChangeInvestmentAmount: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}) {
  const [inputValue, setInputValue] = useState(investmentAmount);

  useEffect(() => {
    setInputValue(investmentAmount);
  }, [investmentAmount]);

  useEffect(() => {
    if (!isPendingInvesting) {
      setInputValue(0);
    }
  }, [isPendingInvesting]);

  return (
    <>
      <div className="mt-6 flex">
        <div className="relative mr-2 inline-block w-2/5">
          <span className="pointer-events-none absolute left-2 top-[48%] -translate-y-1/2 text-white">$</span>
          <RntInputTransparent
            className="text-white"
            type="text"
            value={inputValue <= 0 ? "" : inputValue}
            onChange={handleChangeInvestmentAmount}
            placeholder="0"
          />
        </div>
        <RntButton
          className="mb-0.5 flex w-3/5 items-center justify-center"
          disabled={investmentAmount <= 0 || isPendingInvesting}
          onClick={() => handleInvest(investmentAmount, investmentId)}
        >
          {isPendingInvesting ? <>{t("invest.loading")}</> : <>{t("invest.btn_invest_now")}</>}
        </RntButton>
      </div>
      <p className="text-center text-[#FFFFFF70]">Enter USD equivalent, transaction in ETH</p>
    </>
  );
}

export default InvestNow;
