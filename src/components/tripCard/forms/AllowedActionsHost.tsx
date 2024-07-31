import RntCheckbox from "@/components/common/rntCheckbox";
import RntInput from "@/components/common/rntInput";
import RntSelect from "@/components/common/rntSelect";
import { TripStatus } from "@/model/blockchain/schemas";
import { getRefuelCharge, TripInfo } from "@/model/TripInfo";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { SetStateAction } from "react";

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
    <div className="flex flex-col gap-4 py-4">
      {tripInfo.allowedActions[0].params.map((param, index) => {
        return (
          <div className="flex flex-col md:flex-row" key={param.text}>
            <div className="flex items-end w-full md:w-1/2 xl:w-1/3">
              {param.type === "fuel" ? (
                <RntSelect
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
                >
                  <option className="hidden" disabled></option>
                  <option value="0">0%</option>
                  <option value="0.1">10%</option>
                  <option value="0.2">20%</option>
                  <option value="0.3">30%</option>
                  <option value="0.4">40%</option>
                  <option value="0.5">50%</option>
                  <option value="0.6">60%</option>
                  <option value="0.7">70%</option>
                  <option value="0.8">80%</option>
                  <option value="0.9">90%</option>
                  <option value="1">100%</option>
                </RntSelect>
              ) : (
                <RntInput
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
                <RntCheckbox
                  className="ml-4"
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
                <div className="md:w-1/2 xl:w-1/4 md:mx-8 xl:mx-28 grid grid-cols-2 text-sm">
                  <span className="font-bold col-span-2">{t("booked.reimbursement")}</span>
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
                <div className="md:w-1/2 xl:w-1/4 md:mx-8 xl:mx-28 grid grid-cols-2 text-sm">
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
