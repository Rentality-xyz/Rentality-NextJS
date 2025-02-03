import RntButton from "../common/rntButton";
import { useMemo, useState } from "react";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import RntInput from "../common/rntInput";
import { InvestmentWithMetadata } from "@/model/blockchain/schemas";
import { ENGINE_TYPE_PETROL_STRING, getEngineTypeString } from "@/model/EngineType";
import { MappedInvestmentInfo } from "@/model/InvestmentInfo";

type TFunction = (key: string, options?: { [key: string]: any }) => string;

export default function InvestCar({
  searchInfo,
  handleInvest,
  disableButton,
  isSelected,
  setSelected,
  t,
  isCreator,
  handleStartHosting,
  handleClaimIncome,
}: {
  searchInfo: MappedInvestmentInfo;
  handleInvest: (amount: number, investId: number) => void;
  disableButton: boolean;
  isSelected: boolean;
  setSelected: (carID: number) => void;
  t: TFunction;
  isCreator: boolean;
  handleStartHosting: (investId: number) => Promise<void>;
  handleClaimIncome: (investId: number) => Promise<void>;
}) {
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
  let [investAmount, setInvestAmount] = useState(0);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInvestAmount(Number.parseInt(event.target.value));
  };
  const t_item: TFunction = (name, options) => {
    return t("car_search_item." + name, options);
  };

  const mainClasses = useMemo(() => {
    const classNames = "bg-rentality-bg rnt-card flex flex-col md:flex-row rounded-xl overflow-hidden cursor-pointer";
    return isSelected ? classNames + " border-2" : classNames;
  }, [isSelected]);

  return (
    <div className={mainClasses} onClick={() => setSelected(searchInfo.investment.investmentId as unknown as number)}>
      {/* <div className="w-60 h-full min-h-[14rem] flex-shrink-0">
        <Image
          src={searchInfo.investment.image}
          alt=""
          width={1000}
          height={1000}
          className="h-full w-full object-cover"
        />
      </div> */}
      <div
        style={{ backgroundImage: `url(${searchInfo.metadata.image})` }}
        className="relative w-full md:w-64 min-h-[12rem] flex-shrink-0 bg-center bg-cover"
      ></div>
      <div className="flex w-full flex-col justify-between p-2 sm:p-4">
        <div className="flex flex-row items-baseline justify-between ">
          <div className="w-full overflow-hidden">
            <strong className="text-lg truncate">{`${searchInfo.investment.investment.car.brand} ${searchInfo.investment.investment.car.model} ${searchInfo.investment.investment.car.yearOfProduction}`}</strong>
          </div>
        </div>
        <div className="flex md:grid md:grid-cols-[2fr_1fr] text-sm mt-2 md:justify-between">
          <div className="w-8/12 lg:w-9/12 flex flex-col">
            <div className="text-base">
              <strong>
                {"Price: " + "$" + Number.parseInt(searchInfo.investment.investment.priceInUsd.toString()) / 100}
              </strong>
            </div>

            <div className="text-base">
              <strong>{"Value left: " + "$" + displayMoneyWith2Digits(priceDiff > 0 ? priceDiff : 0)}</strong>
            </div>
          </div>

          <div className="flex flex-col w-auto">
            <div>
              - {getEngineTypeString(searchInfo.investment.investment.car.engineType) ?? ENGINE_TYPE_PETROL_STRING}
            </div>
            <div>- {searchInfo.metadata.transmission}</div>
            <div>
              - {searchInfo.metadata.seatsNumber} {t_item("seats")}
            </div>
          </div>
        </div>
        {searchInfo.investment.isCarBought ? (
          <div>
            <div className="w-8/12 lg:w-9/12 flex flex-col">
              <div className="text-base">
                <strong>{"Total profit: " + "$" + displayMoneyWith2Digits(income)}</strong>
              </div>
              <div className="text-base">
                <strong>{"My profit part: " + "$" + displayMoneyWith2Digits(myIncome)}</strong>
              </div>
            </div>
            {myIncome > 0 ? (
              <div className="w-full grid grid-cols-[1fr_auto] items-end mt-4">
                <RntButton
                  className="h-14 w-44 text-base"
                  onClick={() => handleClaimIncome(searchInfo.investment.investmentId as unknown as number)}
                >
                  <div>{"Claim"}</div>
                  <div>{myIncome}</div>
                </RntButton>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        ) : isCreator && isReadyToClaim() ? (
          <RntButton
            className="h-14 w-44 text-base"
            onClick={() => handleStartHosting(searchInfo.investment.investmentId as unknown as number)}
            disabled={disableButton}
          >
            <div>{"Start hosting"}</div>
          </RntButton>
        ) : (
          <div className="w-full grid grid-cols-[1fr_auto] items-end mt-4">
            <RntInput
              type="number"
              value={investAmount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="p-2 border rounded"
            />
            <RntButton
              className="h-14 w-44 text-base"
              onClick={() => handleInvest(investAmount, searchInfo.investment.investmentId as unknown as number)}
              disabled={disableButton}
            >
              <div>{"Invest"}</div>
              <div>{investAmount}</div>
            </RntButton>
          </div>
        )}
      </div>
    </div>
  );
}
