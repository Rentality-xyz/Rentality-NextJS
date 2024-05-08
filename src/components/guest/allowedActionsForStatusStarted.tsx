import { ChangeTripParams, TripInfo, getRefuelValueAndCharge } from "@/model/TripInfo";
import RntInput from "../common/rntInput";
import { SetStateAction, useState } from "react";
import RntSelect from "../common/rntSelect";
import { calculateDays } from "@/utils/date";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";
import { TripStatus } from "@/model/blockchain/schemas";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";

export default function AllowedActionsForStatusStarted({
  params,
  tripInfo,
  inputParams,
  setInputParams,
}: {
  params: ChangeTripParams[];
  tripInfo: TripInfo;
  inputParams: string[];
  setInputParams: (value: SetStateAction<string[]>) => void;
}) {
  const [endLevelInPercents, setEndLevelInPercents] = useState<number>(0);
  const [overmileValue, setOvermileValue] = useState<number>(0);

  const depositPaid = tripInfo.depositInUsd;
  const { refuelValue, refuelCharge } = getRefuelValueAndCharge(tripInfo, endLevelInPercents);
  const overmilesCharge = overmileValue * tripInfo.overmilePrice;
  let depositToBeReturned = depositPaid - refuelCharge - overmilesCharge;
  depositToBeReturned = depositToBeReturned > 0 ? depositToBeReturned : 0;

  return (
    <>
      <div className="flex flex-col md:flex-row md:gap-8 mb-4">
        <div className="flex flex-col flex-1">
          <div className="flex flex-col">
            <div className="font-bold mt-2">Fuel or Battery level, %</div>
            <div className="flex flex-row gap-8">
              <RntInput
                className="w-1/2 py-2"
                id="fuelAtStartTrip"
                label="At start trip"
                readOnly={true}
                value={`${tripInfo.startFuelLevelInPercents.toString()}%`}
              />
              <RntSelect
                className="w-1/2 py-2"
                id="fuelAtEndTrip"
                label="At end trip"
                readOnly={false}
                value={inputParams[0]}
                onChange={(e) => {
                  const newValue = e.target.value;

                  setInputParams((prev) => {
                    const copy = [...prev];
                    copy[0] = newValue;
                    return copy;
                  });
                  setEndLevelInPercents(Number(newValue) * 100 ?? 0);
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
            </div>
          </div>
          <div className="flex flex-col">
            <div className="font-bold mt-2">Odometer</div>
            <div className="flex flex-row gap-8">
              <RntInput
                className="w-1/2 py-2"
                id="fuelAtStartTrip"
                label="At start trip"
                readOnly={true}
                value={tripInfo.startOdometr.toString()}
              />
              <RntInput
                className="w-1/2 py-2"
                id="fuelAtStartTrip"
                label="At end trip"
                readOnly={false}
                value={inputParams[1]}
                onChange={(e) => {
                  const newValue = e.target.value;

                  setInputParams((prev) => {
                    const copy = [...prev];
                    copy[1] = newValue;
                    return copy;
                  });
                  if (tripInfo.status === TripStatus.Started) {
                    const endOdometr = Number(newValue) ?? 0;
                    const tripDays = calculateDays(tripInfo.tripStart, tripInfo.tripEnd);
                    let overMiles = endOdometr - tripInfo.startOdometr - tripInfo.milesIncludedPerDay * tripDays;
                    overMiles = overMiles > 0 ? overMiles : 0;
                    setOvermileValue(overMiles);
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="font-bold mt-2">Reimbursement charge:</div>
          <div className="grid grid-cols-2 mt-2 md:mt-4 text-sm">
            <span className="col-span-1">Refuel:</span>
            <span className="col-span-1 text-right">{refuelValue} gal</span>
            <span className="col-span-1">Gal price:</span>
            <span className="col-span-1 text-right">${displayMoneyWith2Digits(tripInfo.fuelPricePerGal)}</span>
            <span className="col-span-1">Refuel or battery charge:</span>
            <span className="col-span-1 text-right">${displayMoneyWith2Digits(refuelCharge)}</span>
          </div>
          <div className="grid grid-cols-2 mt-2 md:mt-4 text-sm">
            <span className="col-span-1">Miles included:</span>
            <span className="col-span-1 text-right">
              {getMilesIncludedPerDayText(tripInfo.milesIncludedPerDay)} mi per trip
            </span>
            <span className="col-span-1">Overmiles:</span>
            <span className="col-span-1 text-right">{overmileValue} mi per trip</span>
            <span className="col-span-1">Overmile price:</span>
            <span className="col-span-1 text-right">${tripInfo.overmilePrice.toFixed(4)}</span>
            <span className="col-span-1">Overmile charge:</span>
            <span className="col-span-1 text-right">${displayMoneyWith2Digits(overmilesCharge)}</span>
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="font-bold mt-4 md:mt-2">Security deposit info:</div>
          <div className="grid grid-cols-2 gap-x-2 mt-2 md:mt-4 text-sm">
            <span className="col-span-1">Received deposit:</span>
            <span className="col-span-1 text-right">${displayMoneyWith2Digits(depositPaid)}</span>
            <span className="col-span-1">Refuel or battery charge:</span>
            <div className="col-span-1 text-right flex items-end">
              <span className="w-full">${displayMoneyWith2Digits(refuelCharge)}</span>
            </div>
            <span className="col-span-1">Overmiles reimbursement:</span>
            <div className="col-span-1 text-right flex items-end">
              <span className="w-full">${displayMoneyWith2Digits(overmilesCharge)}</span>
            </div>
            <span className="col-span-1">Deposit to be returned:</span>
            <div className="col-span-1 text-right flex items-end">
              <span className="w-full">${displayMoneyWith2Digits(depositToBeReturned)}</span>
            </div>
          </div>
          <div className="mt-2 md:mt-4">Deposit returned after the Host Completed the trip</div>
        </div>
      </div>
    </>
  );
}
