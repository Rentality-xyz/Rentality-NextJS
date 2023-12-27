import {
  ChangeTripParams,
  TripInfo,
  TripStatus,
  getFuelLevelFromGalsString,
  getGalsFromFuelLevel,
} from "@/model/TripInfo";
import RntInput from "../common/rntInput";
import { SetStateAction, useState } from "react";
import RntSelect from "../common/rntSelect";
import { calculateDays } from "@/utils/date";

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
  const [refuelValue, setRefuelValue] = useState<number>(0);
  const [overmileValue, setOvermileValue] = useState<number>(0);

  const depositPaid = tripInfo.depositPaid;
  const reFuelCharge = refuelValue * tripInfo.fuelPricePerGal;
  const overmilesCharge = overmileValue * tripInfo.overmilePrice;
  let depositToBeReturned = depositPaid - reFuelCharge - overmilesCharge;
  depositToBeReturned = depositToBeReturned > 0 ? depositToBeReturned : 0;

  return (
    <>
      <div className="flex flex-col md:flex-row md:gap-8 mb-4">
        <div className="flex flex-col flex-1">
          <div className="flex flex-col">
            <div className="font-bold mt-2">Fuel level</div>
            <div className="flex flex-row gap-8">
              <RntInput
                className="w-1/2 py-2"
                id="fuelAtStartTrip"
                label="At start trip"
                readOnly={true}
                value={getFuelLevelFromGalsString(tripInfo, tripInfo.startFuelLevelInGal)}
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

                  const endLevel = Number(newValue) ?? 0;
                  const endLevelInGals = getGalsFromFuelLevel(tripInfo, endLevel);
                  let fuelDiffs = tripInfo.startFuelLevelInGal - endLevelInGals;
                  fuelDiffs = fuelDiffs > 0 ? fuelDiffs : 0;
                  setRefuelValue(fuelDiffs);
                }}
              >
                <option className="hidden" disabled></option>
                <option value="0">0</option>
                <option value="0.125">1/8</option>
                <option value="0.25">1/4</option>
                <option value="0.375">3/8</option>
                <option value="0.5">1/2</option>
                <option value="0.625">5/8</option>
                <option value="0.75">3/4</option>
                <option value="0.875">7/8</option>
                <option value="1">full</option>
              </RntSelect>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="font-bold mt-2">Odometr</div>
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
            <span className="col-span-1">Tank size:</span>
            <span className="col-span-1 text-right">{tripInfo.tankVolumeInGal} gal</span>
            <span className="col-span-1">ReFuel:</span>
            <span className="col-span-1 text-right">{refuelValue} gal</span>
            <span className="col-span-1">Gal price:</span>
            <span className="col-span-1 text-right">${tripInfo.fuelPricePerGal.toFixed(2)}</span>
            <span className="col-span-1">Charge:</span>
            <span className="col-span-1 text-right">${reFuelCharge.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 mt-2 md:mt-4 text-sm">
            <span className="col-span-1">Miles included:</span>
            <span className="col-span-1 text-right">{tripInfo.milesIncludedPerDay} mi per trip</span>
            <span className="col-span-1">Overmiles:</span>
            <span className="col-span-1 text-right">{overmileValue} mi per trip</span>
            <span className="col-span-1">Overmile price:</span>
            <span className="col-span-1 text-right">${tripInfo.overmilePrice.toFixed(4)}</span>
            <span className="col-span-1">Charge:</span>
            <span className="col-span-1 text-right">${overmilesCharge.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="font-bold mt-4 md:mt-2">Security deposite info:</div>
          <div className="grid grid-cols-2 gap-x-2 mt-2 md:mt-4 text-sm">
            <span className="col-span-1">Received deposit:</span>
            <span className="col-span-1 text-right">${depositPaid.toFixed(2)}</span>
            <span className="col-span-1">ReFuel reimbursement:</span>
            <div className="col-span-1 text-right flex items-end">
              <span className="w-full">${reFuelCharge.toFixed(2)}</span>
            </div>
            <span className="col-span-1">Overmiles reimbursement:</span>
            <div className="col-span-1 text-right flex items-end">
              <span className="w-full">${overmilesCharge.toFixed(2)}</span>
            </div>
            <span className="col-span-1">Deposit to be returned:</span>
            <div className="col-span-1 text-right flex items-end">
              <span className="w-full">${depositToBeReturned.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-2 md:mt-4">Deposit returned after the Host Completed the trip</div>
        </div>
      </div>
    </>
  );
}
