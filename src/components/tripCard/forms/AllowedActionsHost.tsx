import RntCheckbox, { CheckboxLight } from "@/components/common/rntCheckbox";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import { TripStatus } from "@/model/blockchain/schemas";
import { getRefuelCharge, TripInfo } from "@/model/TripInfo";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import React, { SetStateAction } from "react";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import RntInputTransparent from "@/components/common/rntInputTransparent";

export default function AllowedActionsHost({
  tripInfo,
  inputParams,
  setInputParams,
  confirmParams,
  setConfirmParams,
  t,
}: {
  tripInfo: TripInfo;
  inputParams: string[];
  setInputParams: (value: SetStateAction<string[]>) => void;
  confirmParams: boolean[];
  setConfirmParams: (value: SetStateAction<boolean[]>) => void;
  t: TFunction;
}) {
  const refuelCharge = getRefuelCharge(tripInfo, tripInfo.endFuelLevelInPercents);

  return (
    <div className="flex w-full flex-col gap-4 py-4">
      {tripInfo.allowedActions[0].params.map((param, index) => {
        return (
          <div className="flex w-full flex-col md:flex-row" key={param.text}>
            <div className="flex w-full items-center">
              {param.type === "fuel" ? (
                <RntFilterSelect
                  isTransparentStyle={true}
                  containerClassName="w-full"
                  id={param.text}
                  label={param.text}
                  disabled={tripInfo.allowedActions[0].readonly}
                  value={inputParams[index]}
                  onChange={(e) => {
                    setInputParams((prev) => {
                      const copy = [...prev];
                      copy[index] = e.target.value;
                      return copy;
                    });
                  }}
                >
                  <RntFilterSelect.Option value="0">0%</RntFilterSelect.Option>
                  <RntFilterSelect.Option value="0.1">10%</RntFilterSelect.Option>
                  <RntFilterSelect.Option value="0.2">20%</RntFilterSelect.Option>
                  <RntFilterSelect.Option value="0.3">30%</RntFilterSelect.Option>
                  <RntFilterSelect.Option value="0.4">40%</RntFilterSelect.Option>
                  <RntFilterSelect.Option value="0.5">50%</RntFilterSelect.Option>
                  <RntFilterSelect.Option value="0.6">60%</RntFilterSelect.Option>
                  <RntFilterSelect.Option value="0.7">70%</RntFilterSelect.Option>
                  <RntFilterSelect.Option value="0.8">80%</RntFilterSelect.Option>
                  <RntFilterSelect.Option value="0.9">90%</RntFilterSelect.Option>
                  <RntFilterSelect.Option value="1">100%</RntFilterSelect.Option>
                </RntFilterSelect>
              ) : (
                <RntInputTransparent
                  className="w-full"
                  id={param.text}
                  label={param.text}
                  readOnly={tripInfo.allowedActions[0].readonly}
                  value={inputParams[index]}
                  onChange={(e) => {
                    setInputParams((prev) => {
                      const copy = [...prev];
                      copy[index] = e.target.value;
                      return copy;
                    });
                  }}
                />
              )}

              {tripInfo.allowedActions[0].readonly ? (
                <CheckboxLight
                  className="ml-4 mt-7"
                  label={t("common.confirm")}
                  checked={confirmParams[index]}
                  onChange={(newValue) => {
                    setConfirmParams((prev) => {
                      const copy = [...prev];
                      copy[index] = newValue.target.checked;
                      return copy;
                    });
                  }}
                />
              ) : null}
            </div>

            {tripInfo.status === TripStatus.CheckedOutByGuest ? (
              param.type === "fuel" ? (
                <div className="grid grid-cols-2 text-sm md:mx-8 xl:w-1/3">
                  <span className="col-span-2 font-bold">{t("booked.reimbursement")}</span>
                  <span>{t("booked.pickUp_fuel")}</span>
                  <span>{tripInfo.startFuelLevelInPercents}%</span>
                  <span>{t("booked.dropOff_fuel")}</span>
                  <span>{tripInfo.endFuelLevelInPercents}%</span>
                  <span>{t("booked.price_per_10_percents")}</span>
                  <span>${displayMoneyWith2Digits(tripInfo.pricePer10PercentFuel)}</span>
                  <span>{t("booked.total_refuel_charge")}</span>
                  <span>${displayMoneyWith2Digits(refuelCharge)}</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 text-sm md:mx-8 xl:w-1/3">
                  <span>{t("booked.overmiles")}</span>
                  <span>{tripInfo.overmileValue}</span>
                  <span>{t("booked.overmile_price")}</span>
                  <span>${displayMoneyWith2Digits(tripInfo.overmilePrice)}</span>
                  <span>{t("booked.overmile_charge")}</span>
                  <span>${displayMoneyWith2Digits(tripInfo.overmileValue * tripInfo.overmilePrice)}</span>
                </div>
              )
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
