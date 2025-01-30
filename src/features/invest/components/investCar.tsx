import RntButton from "../../../components/common/rntButton";
import React, { useMemo, useState } from "react";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import RntInput from "../../../components/common/rntInput";
import { InvestmentWithMetadata } from "@/model/blockchain/schemas";
import { ENGINE_TYPE_PETROL_STRING, getEngineTypeString } from "@/model/EngineType";
import { useTranslation } from "react-i18next";
import RntInputTransparent from "@/components/common/rntInputTransparent";

const ccsDividerVert = "max-2xl:hidden absolute right-[-5px] top-1/2 h-[80%] w-px translate-y-[-50%] bg-gray-500";
const ccsDividerHor = "2xl:hidden absolute bottom-[-10px] left-[5%] h-px w-[90%] translate-y-[-50%] bg-gray-500";

export default function InvestCar({
  isHost,
  searchInfo,
  handleInvest,
  isCreator,
  handleStartHosting,
  handleClaimIncome,
}: {
  isHost: boolean;
  searchInfo: InvestmentWithMetadata;
  handleInvest: (amount: number, investId: number) => void;
  isCreator: boolean;
  handleStartHosting: (investId: number) => Promise<void>;
  handleClaimIncome: (investId: number) => Promise<void>;
}) {
  const { t } = useTranslation();
  const test = isHost ? t("invest.host_management") : t("invest.your_expected_earnings");

  const [investmentAmount, setInvestmentAmount] = useState(0);

  const handleChangeInvestmentAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputInvestmentAmount = e.target.value.replace(/\D/g, ""); // Удаляем всё, кроме цифр
    setInvestmentAmount(Number.parseInt(inputInvestmentAmount));
  };

  const priceDiff =
    (Number.parseInt(searchInfo.investment.investment.priceInUsd.toString()) -
      Number.parseInt(searchInfo.investment.payedInUsd.toString())) /
    100;
  let myIncome = Number.parseInt(searchInfo.investment.myIncome.toString());
  myIncome = myIncome > 0 ? myIncome / 100 : myIncome;

  let income = Number.parseInt(searchInfo.investment.income.toString());
  income = income > 0 ? income / 100 : income;
  const isReadyToClaim = (): boolean => {
    return priceDiff <= 0;
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 fullHD:grid-cols-2">
      <div className="flex w-full flex-col rounded-xl bg-rentality-bg-left-sidebar">
        <div className="w-full rounded-t-xl bg-blue-600 py-1 pl-4">
          <div className="flex max-2xl:flex-col">
            <span>Available to Invest</span>
            <span className="mx-2 max-2xl:hidden">|</span>
            <span>Waiting for full tokenization</span>
          </div>
        </div>
        <div className="flex w-full flex-col">
          <div
            style={{ backgroundImage: `url(${searchInfo.metadata.image})` }}
            className="h-[180px] bg-cover bg-center bg-no-repeat p-2 2xl:h-[480px] fullHD:h-[340px]"
          ></div>
          <div className="flex w-full grid-cols-[1.5fr_1fr_1fr] flex-col gap-2 2xl:grid">
            <div className="relative p-2">
              <p className="text-xl font-bold">
                {`${searchInfo.investment.investment.car.brand} ${searchInfo.investment.investment.car.model} ${searchInfo.investment.investment.car.yearOfProduction}`}
              </p>
              <p className="font-medium text-[#FFFFFF70]">
                {`${searchInfo.investment.investment.car.locationInfo.locationInfo.city}, ${searchInfo.investment.investment.car.locationInfo.locationInfo.state}, ${searchInfo.investment.investment.car.locationInfo.locationInfo.country}`}
              </p>
              <p className="mt-2 text-rentality-secondary 2xl:text-lg">You have no stake in this asset yet</p>
              <div className="mt-6 flex">
                <div className="relative mr-2 inline-block w-2/5">
                  <span className="pointer-events-none absolute left-2 top-[48%] -translate-y-1/2 text-white">$</span>
                  <RntInputTransparent
                    className="text-white"
                    type="text"
                    value={investmentAmount}
                    onChange={handleChangeInvestmentAmount}
                    placeholder="0"
                  />
                </div>
                <RntButton
                  className="mb-0.5 flex w-3/5 items-center justify-center"
                  // onClick={() => claimPoints()}
                >
                  <div className="ml-0.5 flex items-center">
                    {t("invest.btn_invest_now")}
                    <span className="ml-4">●</span>
                  </div>
                </RntButton>
              </div>
              <p className="text-center text-[#FFFFFF70]">Enter USD equivalent, transaction in ETH</p>
              <p className="mt-8">Listing status:</p>
              <p className="text-rentality-secondary">Waiting for full tokenization</p>
              <div className={ccsDividerVert}></div>
              <div className={ccsDividerHor}></div>
            </div>
            <div className="relative flex h-full flex-col p-2 text-center max-2xl:py-4">
              <p className="text-xl font-semibold max-2xl:mb-4">{t("invest.tokenization")}</p>
              <div className="flex flex-grow flex-col justify-center">
                <p className="text-xl font-bold 2xl:text-2xl">$80 000</p>
                <p className="2xl:text-lg">Total price</p>
                <div className="mx-auto my-2 h-0.5 w-[60%] translate-y-[-50%] bg-white"></div>
                <p className="text-xl font-bold leading-none text-rentality-secondary 2xl:text-2xl">$10 000</p>
                <p className="leading-snug text-rentality-secondary 2xl:text-lg">Balance to be raised</p>
              </div>
              <div className={ccsDividerVert}></div>
              <div className={ccsDividerHor}></div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 max-2xl:py-4">
              <span className="text-lg text-rentality-secondary 2xl:text-xl fullHD:text-base">{test}</span>
              <span className="text-lg 2xl:text-xl">40% {t("invest.from_each_trip")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
