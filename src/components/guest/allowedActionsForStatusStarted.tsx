import {
  ChangeTripParams,
  TripInfo,
  TripStatus,
  getFuelLevelFromGals,
  getFuelLevelFromGalsString,
  getGalsFromFuelLevel,
} from "@/model/TripInfo";
import RntInput from "../common/rntInput";
import { ChangeEvent, SetStateAction, useState } from "react";
import RntSelect from "../common/rntSelect";
import Checkbox from "../common/checkbox";
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
  // inputParam: string;
  // onChange: (newValue: string) => void;
}) {
  const [refuelValue, setRefuelValue] = useState<number>(0);
  const [overmileValue, setOvermileValue] = useState<number>(0);

  const depositPaid = 100;
  const reFuelCharge = refuelValue * tripInfo.fuelPricePerGal;
  const overmilesCharge = overmileValue * tripInfo.overmilePrice;
  let depositToBeReturned = depositPaid - reFuelCharge - overmilesCharge;
  depositToBeReturned = depositToBeReturned > 0 ? depositToBeReturned : 0;

  return (
    <>
      <div className="flex flex-row gap-8 mb-4">
        <div className="flex flex-col flex-1">
          <div className="flex flex-col">
            <div className="font-bold mt-2">Fuel level</div>
            <div className="flex flex-row gap-8">
              <RntInput
                className="w-1/2 py-2"
                id="fuelAtStartTrip"
                label="At start trip"
                readOnly={true}
                value={getFuelLevelFromGalsString(
                  tripInfo,
                  tripInfo.startFuelLevelInGal
                )}
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
                  const endLevelInGals = getGalsFromFuelLevel(
                    tripInfo,
                    endLevel
                  );
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
                    const tripDays = calculateDays(
                      tripInfo.tripStart,
                      tripInfo.tripEnd
                    );
                    let overMiles =
                      endOdometr -
                      tripInfo.startOdometr -
                      tripInfo.milesIncludedPerDay * tripDays;
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
          <div className="grid grid-cols-2 mt-4 text-sm">
            <span>Tank size:</span>
            <span>{tripInfo.tankVolumeInGal} gal</span>
            <span>ReFuel:</span>
            <span>{refuelValue} gal</span>
            <span>Gal price:</span>
            <span>${tripInfo.fuelPricePerGal.toFixed(2)}</span>
            <span>Charge:</span>
            <span>${reFuelCharge.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 mt-4 text-sm">
            <span>Miles included:</span>
            <span>{tripInfo.milesIncludedPerDay} mi per trip</span>
            <span>Overmiles:</span>
            <span>{overmileValue} mi per trip</span>
            <span>Overmile price:</span>
            <span>${tripInfo.overmilePrice.toFixed(4)}</span>
            <span>Charge:</span>
            <span>${overmilesCharge.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="font-bold mt-2">Security deposite info:</div>
          <div className="grid grid-cols-2 gap-x-2 mt-4 text-sm">
            <span>Received deposit:</span>
            <span>${depositPaid.toFixed(2)}</span>
            <span>ReFuel reimbursement:</span>
            <span>${reFuelCharge.toFixed(2)}</span>
            <span>Overmiles reimbursement:</span>
            <span>${overmilesCharge.toFixed(2)}</span>
            <span>Deposit to be returned:</span>
            <span>${depositToBeReturned.toFixed(2)}</span>
          </div>
          <div className="mt-4">
            Deposit returned after the Host Completed the trip
          </div>
        </div>
      </div>

      {/* <div className="hidden">
        {param.type === "fuel" ? (
          <RntInput
            className="w-1/6 py-2"
            id="fuelAtStartTrip"
            label="At start trip"
            readOnly={true}
            value={"0"}
          />
        ) : (
          <RntInput
            className="w-1/6 py-2"
            id="odometrAtStartTrip"
            label="At start trip"
            readOnly={true}
            value={"0"}
          />
        )}

        {param.type === "fuel" ? (
          <RntSelect
            className="w-1/6 py-2"
            id={param.text}
            label={param.text}
            readOnly={tripInfo.allowedActions[0].readonly}
            value={inputParam}
            onChange={(e) => {
              const newValue = e.target.value;
              onChange(newValue);
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
        ) : (
          <RntInput
            className="w-1/6 py-2"
            id={param.text}
            label={param.text}
            readOnly={tripInfo.allowedActions[0].readonly}
            value={inputParam}
            onChange={(e) => {
              const newValue = e.target.value;
              onChange(newValue);
            }}
          />
        )}

        {tripInfo.allowedActions[0].readonly ? (
          <Checkbox
            className="ml-4"
            title="Confirm"
            value={confirmParam}
            onChange={(newValue) => {
              onChangeConfirmParam(newValue.target.checked);
            }}
          />
        ) : null}
      </div>
      {param.type === "fuel" ? (
        <RntInput
          className="w-1/6 py-2"
          id="fuelAtStartTrip"
          label="At start trip"
          readOnly={true}
          value={"0"}
        />
      ) : (
        <RntInput
          className="w-1/6 py-2"
          id="odometrAtStartTrip"
          label="At start trip"
          readOnly={true}
          value={"0"}
        />
      )}

      {param.type === "fuel" ? (
        <RntSelect
          className="w-1/6 py-2"
          id={param.text}
          label={param.text}
          readOnly={tripInfo.allowedActions[0].readonly}
          value={inputParam}
          onChange={(e) => {
            const newValue = e.target.value;
            onChange(newValue);
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
      ) : (
        <RntInput
          className="w-1/6 py-2"
          id={param.text}
          label={param.text}
          readOnly={tripInfo.allowedActions[0].readonly}
          value={inputParam}
          onChange={(e) => {
            const newValue = e.target.value;
            onChange(newValue);
          }}
        />
      )}

      {tripInfo.allowedActions[0].readonly ? (
        <Checkbox
          className="ml-4"
          title="Confirm"
          value={confirmParam}
          onChange={(newValue) => {
            onChangeConfirmParam(newValue.target.checked);
          }}
        />
      ) : null} */}
    </>
  );
}
