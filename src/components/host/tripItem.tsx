import Image from "next/image";
import Link from "next/link";
import { dateFormat } from "@/utils/datetimeFormatters";
import { TripInfo, TripStatus, getTripStatusTextFromStatus } from "@/model/TripInfo";
import { useState } from "react";
import InputBlock from "../inputBlock";
import Button from "../common/button";
import Checkbox from "../common/checkbox";
import SelectBlock from "../inputBlock/selectBlock";
import { calculateDays } from "@/utils/date";

type Props = {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
  disableButton:boolean;
};

export default function TripItem({ tripInfo, changeStatusCallback, disableButton}: Props) {
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
  var refuelValue = tripInfo.startFuelLevelInGal - tripInfo.endFuelLevelInGal;
  refuelValue = refuelValue > 0 ? refuelValue : 0;
  
  const tripDays = calculateDays(tripInfo.tripStart, tripInfo.tripEnd);
  var overmileValue = tripInfo.endOdometr - tripInfo.startOdometr - tripInfo.milesIncludedPerDay * tripDays ; 
  overmileValue = overmileValue > 0 ? overmileValue : 0;
  

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

  return (
    <div className="flex flex-col  rounded-xl bg-pink-100">
      <div className="flex flex-wrap">
        <div className="relative h-56 w-60 flex-shrink-0 rounded-l-xl bg-slate-400 text-center">
          {/* <Image src={carInfo.image} alt="" width={240} height={192} className="w-60 h-48 rounded-lg object-cover" /> */}
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
          <div className="absolute right-0 top-2 px-8 py-2 text-gray-100 bg-purple-600 rounded-l-3xl">
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
                  <button
                    key={action.text}
                    className="h-16 w-full rounded-md bg-violet-700 disabled:bg-gray-500 px-4"
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
                  </button>
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
            <Link href={`/host/trips/tripInfo/${tripInfo.tripId}`}>
              <Button className="w-full h-16 bg-violet-700 disabled:bg-gray-500 rounded-md px-4">
                Details
              </Button>
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
              Please {tripInfo.allowedActions[0].readonly ? "confirm" : "enter"} data to change status:
            </strong>
          </div>
          <div className="flex flex-col py-4">
            {tripInfo.allowedActions[0].params.map((param, index) => {
              return (
                <div className="flex flex-row items-end" key={param.text}>
                  {param.type === "fuel" ? (
                    <SelectBlock
                      className="w-1/3 py-2"
                      id={param.text}
                      label={param.text}
                      readOnly={tripInfo.allowedActions[0].readonly}
                      value={inputParams[index]}
                      setValue={(newValue) => {
                        setInputParams((prev) => {
                          const copy = [...prev];
                          copy[index] = newValue;
                          return copy;
                        });
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
                    </SelectBlock>
                  ) : (
                    <InputBlock
                      className="w-1/3 py-2"
                      id={param.text}
                      label={param.text}
                      readOnly={tripInfo.allowedActions[0].readonly}
                      value={inputParams[index]}
                      setValue={(newValue) => {
                        setInputParams((prev) => {
                          const copy = [...prev];
                          copy[index] = newValue;
                          return copy;
                        });
                      }}
                    />
                  )}

                  {tripInfo.status === TripStatus.CheckedOutByGuest ? 
                    param.type === "fuel"?(
                      <div className="w-1/3 grid grid-cols-2 mx-8 text-sm">
                        <span className="font-bold col-span-2">Reimbursement charge:</span>
                        <span>ReFuel:</span>
                        <span>{refuelValue} gal</span>
                        <span>Gal price:</span>
                        <span>${tripInfo.fuelPricePerGal.toFixed(2)}</span>
                        <span>Charge:</span>
                        <span>${(refuelValue * tripInfo.fuelPricePerGal).toFixed(2)}</span>
                      </div>
                    ):(
                      <div className="w-1/3 grid grid-cols-2 mx-8 text-sm">
                        <span className="font-bold col-span-2">Reimbursement charge:</span>
                        <span>Overmiles:</span>
                        <span>{overmileValue}</span>
                        <span>Overmile price:</span>
                        <span>${tripInfo.overmilePrice.toFixed(4)}</span>
                        <span>Charge:</span>
                        <span>${(overmileValue * tripInfo.overmilePrice).toFixed(2)}</span>
                      </div>
                    )
                  
                   : null}

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
          <Button onClick={handleButtonClick} disabled={disableButton}>
            {tripInfo.allowedActions[0].text}
          </Button>
        </div>
      )}
    </div>
  );
}
