import Image from "next/image";
import Link from "next/link";
import { dateFormat } from "@/utils/datetimeFormatters";
import {
  TripInfo,
  TripStatus,
  getGalsFromFuelLevel,
  getTripStatusTextFromStatus,
} from "@/model/TripInfo";
import { useState } from "react";
import Button from "../common/button";
import Checkbox from "../common/checkbox";
import { calculateDays } from "@/utils/date";
import { twMerge } from "tailwind-merge";
import RntSelect from "../common/rntSelect";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";

type Props = {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
  disableButton: boolean;
};

export default function TripItem({
  tripInfo,
  changeStatusCallback,
  disableButton,
}: Props) {
  const [isAdditionalActionHidden, setIsAdditionalActionHidden] =
    useState(true);
  const defaultValues =
    tripInfo?.allowedActions?.length > 0
      ? tripInfo?.allowedActions[0].params.map((i) => {
          return i.value;
        })
      : [];
  const [inputParams, setInputParams] = useState<string[]>(defaultValues);
  const [confirmParams, setConfirmParams] = useState<boolean[]>([]);
  const [refuelValue, setRefuelValue] = useState<number>(0);
  const [overmileValue, setOvermileValue] = useState<number>(0);

  const handleButtonClick = () => {
    if (
      tripInfo == null ||
      tripInfo.allowedActions == null ||
      tripInfo.allowedActions.length == 0
    ) {
      return;
    }

    if (
      tripInfo.allowedActions[0].readonly &&
      (confirmParams.length != defaultValues.length ||
        !confirmParams.every((i) => i === true))
    ) {
      return;
    }

    changeStatusCallback(() => {
      return tripInfo.allowedActions[0].action(
        BigInt(tripInfo.tripId),
        inputParams
      );
    });
  };
  let statusBgColor = "";
  switch (tripInfo.status) {
    case TripStatus.Pending:
      statusBgColor = "bg-yellow-600";
      break;
    case TripStatus.Confirmed:
      statusBgColor = "bg-lime-500";
      break;
    case TripStatus.CheckedInByHost:
      statusBgColor = "bg-blue-600";
      break;
    case TripStatus.Started:
      statusBgColor = "bg-blue-800";
      break;
    case TripStatus.CheckedOutByGuest:
      statusBgColor = "bg-purple-600";
      break;
    case TripStatus.Finished:
      statusBgColor = "bg-purple-800";
      break;
    case TripStatus.Closed:
      statusBgColor = "bg-fuchsia-700";
      break;
    case TripStatus.Rejected:
      statusBgColor = "bg-red-500";
      break;
  }
  const statusClassName = twMerge(
    "absolute right-0 top-2 px-8 py-2 text-gray-100 bg-purple-600 rounded-l-3xl",
    statusBgColor
  );

  return (
    <div className="flex flex-col  rounded-xl bg-pink-100">
      <div className="flex flex-wrap">
        <div className="relative h-56 w-60 flex-shrink-0 rounded-l-xl bg-slate-400 text-center">
          <Image
            src={tripInfo.image}
            alt=""
            width={1000}
            height={1000}
            className="h-full w-full rounded-lg object-cover"
          />
          {/* <img
          src={tripInfo.image}
          alt=""
          className="h-full w-full rounded-lg object-cover"
        /> */}
          <div className={statusClassName}>
            <strong className="text-m">{`${getTripStatusTextFromStatus(
              tripInfo.status
            )}`}</strong>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2 p-4">
          <div className="flex flex-col">
            <div>
              <strong className="text-xl">{`${tripInfo.brand} ${tripInfo.model} ${tripInfo.year}`}</strong>
            </div>
            <div>{tripInfo.licensePlate}</div>
            <div className="flex flex-col mt-4">
              <div>
                <strong className="text-l">Total price</strong>
              </div>
              <div>${tripInfo.totalPrice}</div>
            </div>
          </div>

          {!isAdditionalActionHidden ? null : (
            <div className="flex flex-row gap-4">
              {tripInfo.allowedActions.map((action) => {
                return (
                  <RntButton
                    key={action.text}
                    className="h-16 w-full px-4"
                    disabled={disableButton}
                    onClick={() => {
                      if (action.params == null || action.params.length == 0) {
                        changeStatusCallback(() => {
                          return action.action(BigInt(tripInfo.tripId), []);
                        });
                      } else {
                        setIsAdditionalActionHidden(false);
                      }
                    }}
                  >
                    {action.text}
                  </RntButton>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-col">
            <div>
              <strong className="text-l">📅 Trip start</strong>
            </div>
            <div className="whitespace-nowrap">
              {dateFormat(tripInfo.tripStart)}
            </div>
            {/* <div>April 05, 4:00 AM</div> */}
          </div>
          <div className="flex flex-col">
            <div>
              <strong className="text-l">📅 Trip end</strong>
            </div>
            <div className="whitespace-nowrap">
              {dateFormat(tripInfo.tripEnd)}
            </div>
            {/* <div>April 05, 4:00 AM</div> */}
          </div>
        </div>
        <div className="flex flex-col flex-1 justify-between p-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <div>
                <strong className="text-l whitespace-nowrap">
                  📍 Pickup location
                </strong>
              </div>
              <div>{tripInfo.locationStart}</div>
              {/* <div>Miami, CA, USA</div> */}
            </div>
            <div className="flex flex-col">
              <div>
                <strong className="text-l whitespace-nowrap">
                  📍 Return location
                </strong>
              </div>
              <div>{tripInfo.locationEnd}</div>
              {/* <div>Miami, CA, USA</div> */}
            </div>
          </div>
          <div className="w-full self-end">
            <Link href={`/guest/trips/tripInfo/${tripInfo.tripId}`}>
              <RntButton className="h-16 px-4">Details</RntButton>
            </Link>
          </div>
        </div>
      </div>

      {isAdditionalActionHidden ||
      tripInfo.allowedActions == null ||
      tripInfo.allowedActions.length == 0 ||
      tripInfo.allowedActions[0].params == null ? null : (
        <div
          className="flex flex-col px-8 pt-2 pb-4"
          hidden={isAdditionalActionHidden}
        >
          <hr />
          <div>
            <strong className="text-xl">
              Please {tripInfo.allowedActions[0].readonly ? "confirm" : "enter"}{" "}
              data to change status:
            </strong>
          </div>
          <div className="flex flex-col py-4">
            {tripInfo.allowedActions[0].params.map((param, index) => {
              return (
                <div className="flex flex-row items-end" key={param.text}>
                  {param.type === "fuel" ? (
                    <RntSelect
                      className="w-1/3 py-2"
                      id={param.text}
                      label={param.text}
                      readOnly={tripInfo.allowedActions[0].readonly}
                      value={inputParams[index]}
                      onChange={(e) => {
                        const newValue = e.target.value;

                        setInputParams((prev) => {
                          const copy = [...prev];
                          copy[index] = newValue;
                          return copy;
                        });

                        if (tripInfo.status === TripStatus.Started) {
                          const endLevel = Number(newValue) ?? 0;
                          const endLevelInGals = getGalsFromFuelLevel(
                            tripInfo,
                            endLevel
                          );
                          const fuelDiffs =
                            tripInfo.startFuelLevelInGal - endLevelInGals;
                          if (fuelDiffs >= 0) {
                            setRefuelValue(fuelDiffs);
                          }
                        }
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
                      className="w-1/3 py-2"
                      id={param.text}
                      label={param.text}
                      readOnly={tripInfo.allowedActions[0].readonly}
                      value={inputParams[index]}
                      onChange={(e) => {
                        const newValue = e.target.value;

                        setInputParams((prev) => {
                          const copy = [...prev];
                          copy[index] = newValue;
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
                  )}

                  {tripInfo.status === TripStatus.Started ? (
                    param.type === "fuel" ? (
                      <div className="w-1/3 grid grid-cols-2 mx-8 text-sm">
                        <span className="font-bold col-span-2">
                          Reimbursement charge:
                        </span>
                        <span>ReFuel:</span>
                        <span>{refuelValue} gal</span>
                        <span>Gal price:</span>
                        <span>${tripInfo.fuelPricePerGal.toFixed(2)}</span>
                        <span>Charge:</span>
                        <span>
                          ${(refuelValue * tripInfo.fuelPricePerGal).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="w-1/3 grid grid-cols-2 mx-8 text-sm">
                        <span className="font-bold col-span-2">
                          Reimbursement charge:
                        </span>
                        <span>Overmiles:</span>
                        <span>{overmileValue}</span>
                        <span>Overmile price:</span>
                        <span>${tripInfo.overmilePrice.toFixed(4)}</span>
                        <span>Charge:</span>
                        <span>
                          ${(overmileValue * tripInfo.overmilePrice).toFixed(2)}
                        </span>
                      </div>
                    )
                  ) : null}

                  {tripInfo.allowedActions[0].readonly ? (
                    <Checkbox
                      className="ml-4"
                      title="Confirm"
                      value={confirmParams[index]}
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
              );
            })}
          </div>
          <RntButton
            className="h-16 px-4"
            onClick={handleButtonClick}
            disabled={disableButton}
          >
            {tripInfo.allowedActions[0].text}
          </RntButton>
        </div>
      )}
    </div>
  );
}
