import Link from "next/link";
import { dateFormat, dateFormatMonthDate } from "@/utils/datetimeFormatters";
import { useEffect, useRef, useState } from "react";
import {
  TripInfo,
  TripStatus,
  getTripStatusBgColorClassFromStatus,
  getTripStatusTextFromStatus,
} from "@/model/TripInfo";
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

export default function TripItem({ tripInfo, changeStatusCallback, disableButton }: Props) {
  const [isAdditionalActionHidden, setIsAdditionalActionHidden] = useState(true);
  const defaultValues =
    tripInfo?.allowedActions?.length > 0
      ? tripInfo?.allowedActions[0].params.map((i) => {
          return i.value;
        })
      : [];
  const [inputParams, setInputParams] = useState<string[]>(defaultValues);
  const [confirmParams, setConfirmParams] = useState<boolean[]>([]);

  const allowedActions = document.getElementById("host-allowed-actions") as HTMLDivElement;
  const allowedActionsRef = useRef<HTMLDivElement>(allowedActions);
  useEffect(() => {
    if (window.innerWidth <= 1280 && !isAdditionalActionHidden && allowedActionsRef.current) {
      allowedActionsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isAdditionalActionHidden]);

  const handleButtonClick = () => {
    if (tripInfo == null || tripInfo.allowedActions == null || tripInfo.allowedActions.length == 0) {
      return;
    }

    if (
      tripInfo.allowedActions[0].readonly &&
      (confirmParams.length != defaultValues.length || !confirmParams.every((i) => i === true))
    ) {
      return;
    }

    changeStatusCallback(() => {
      return tripInfo.allowedActions[0].action(BigInt(tripInfo.tripId), inputParams);
    });
  };
  let statusBgColor = getTripStatusBgColorClassFromStatus(tripInfo.status);
  const statusClassName = twMerge(
    "absolute right-0 top-2 px-8 py-2 rounded-l-3xl text-rnt-temp-status-text text-end",
    statusBgColor
  );

  var refuelValue = tripInfo.startFuelLevelInGal - tripInfo.endFuelLevelInGal;
  refuelValue = refuelValue > 0 ? refuelValue : 0;

  const tripDays = calculateDays(tripInfo.tripStart, tripInfo.tripEnd);
  var overmileValue = tripInfo.endOdometr - tripInfo.startOdometr - tripInfo.milesIncludedPerDay * tripDays;
  overmileValue = overmileValue > 0 ? overmileValue : 0;

  return (
    <div className="rnt-card flex flex-col rounded-xl overflow-hidden bg-rentality-bg">
      <div className="sm_inverted:flex flex-wrap">
        {/* <div className="relative h-56 w-60 flex-shrink-0">
          <Image
            src={tripInfo.image}
            alt=""
            width={1000}
            height={1000}
            className="h-full w-full object-cover"
          /> */}

        {/* Empty span to generate tatilwind css colors for statuses */}
        <span className="bg-yellow-600 bg-lime-500 bg-blue-600 bg-blue-800 bg-purple-600 bg-purple-800 bg-fuchsia-700 bg-red-500" />
        <div
          style={{ backgroundImage: `url(${tripInfo.image})` }}
          className="relative w-full 1xl:w-64 min-h-[12rem] md:min-h-[16rem] xl:min-h-[12rem] flex-shrink-0 bg-center bg-cover"
        >
          <div className={statusClassName}>
            <strong className="text-m">{`${getTripStatusTextFromStatus(tripInfo.status)}`}</strong>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2 p-4">
          <div className="flex flex-col">
            <div>
              <strong className="text-xl">{`${tripInfo.brand} ${tripInfo.model} ${tripInfo.year}`}</strong>
            </div>
            <div>{tripInfo.licensePlate}</div>
            {tripInfo.status === TripStatus.Rejected && tripInfo.rejectedDate !== undefined ? (
              <div className="mt-2">
                {`${
                  tripInfo.rejectedBy.toLowerCase() === tripInfo.hostAddress.toLowerCase()
                    ? "You"
                    : tripInfo.guestName ?? "Guest"
                } cancelled on ${dateFormatMonthDate(tripInfo.rejectedDate)}`}
              </div>
            ) : null}
            <div className="flex flex-col mt-4">
              <div>
                <strong className="text-l">Total price</strong>
              </div>
              <div>${tripInfo.totalPrice}</div>
            </div>
          </div>

          {!isAdditionalActionHidden ? null : (
            <div className="flex flex-col 2xl:flex-row gap-4">
              {tripInfo.allowedActions.map((action) => {
                return (
                  <RntButton
                    key={action.text}
                    className="h-16 w-full xl:w-56 px-4"
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
              <i className="fi fi-rs-calendar pr-1  text-rentality-icons"></i>
              <strong className="text-l">Trip start</strong>
            </div>
            <div className="whitespace-nowrap">{dateFormat(tripInfo.tripStart)}</div>
            {/* <div>April 05, 4:00 AM</div> */}
          </div>
          <div className="flex flex-col">
            <div>
              <i className="fi fi-rs-calendar pr-1  text-rentality-icons"></i>
              <strong className="text-l">Trip end</strong>
            </div>
            <div className="whitespace-nowrap">{dateFormat(tripInfo.tripEnd)}</div>
            {/* <div>April 05, 4:00 AM</div> */}
          </div>
        </div>
        <div className="flex flex-col flex-1 justify-between p-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <div>
                <i className="fi fi-rs-marker pr-1  text-rentality-icons"></i>
                <strong className="text-l whitespace-nowrap">Pickup location</strong>
              </div>
              <div>{tripInfo.locationStart}</div>
              {/* <div>Miami, CA, USA</div> */}
            </div>
            <div className="flex flex-col">
              <div>
                <i className="fi fi-rs-marker pr-1 text-rentality-icons"></i>
                <strong className="text-l whitespace-nowrap">Return location</strong>
              </div>
              <div>{tripInfo.locationEnd}</div>
              {/* <div>Miami, CA, USA</div> */}
            </div>
          </div>
          <div className="w-full self-end mt-4">
            <Link href={`/host/trips/tripInfo/${tripInfo.tripId}`}>
              <RntButton className="max-md:w-full h-16">Details</RntButton>
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
          ref={(ref) => (allowedActionsRef.current = ref as HTMLDivElement)}
          hidden={isAdditionalActionHidden}
        >
          <hr />
          <div id="host-allowed-actions">
            <strong className="text-xl">
              Please {tripInfo.allowedActions[0].readonly ? "confirm" : "enter"} data to change status:
            </strong>
          </div>
          <div className="flex flex-col py-4">
            {tripInfo.allowedActions[0].params.map((param, index) => {
              return (
                <div className="flex flex-col md:flex-row" key={param.text}>
                  <div className="flex items-end w-full md:w-1/2 xl:w-1/3">
                    {param.type === "fuel" ? (
                      <RntSelect
                        className="w-full py-2"
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
                        className="w-full py-2"
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

                  {tripInfo.status === TripStatus.CheckedOutByGuest ? (
                    param.type === "fuel" ? (
                      <div className="md:w-1/2 xl:w-1/4 md:mx-8 xl:mx-28 grid grid-cols-2 text-sm">
                        <span className="font-bold col-span-2">Reimbursement charge:</span>
                        <span>ReFuel:</span>
                        <span>{refuelValue} gal</span>
                        <span>Gal price:</span>
                        <span>${tripInfo.fuelPricePerGal.toFixed(2)}</span>
                        <span>Charge:</span>
                        <span>${(refuelValue * tripInfo.fuelPricePerGal).toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="md:w-1/2 xl:w-1/4 md:mx-8 xl:mx-28 grid grid-cols-2 text-sm">
                        <span className="font-bold col-span-2">Reimbursement charge:</span>
                        <span>Overmiles:</span>
                        <span>{overmileValue}</span>
                        <span>Overmile price:</span>
                        <span>${tripInfo.overmilePrice.toFixed(4)}</span>
                        <span>Charge:</span>
                        <span>${(overmileValue * tripInfo.overmilePrice).toFixed(2)}</span>
                      </div>
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="flex flex-row gap-4">
            {tripInfo.allowedActions.map((action) => {
              return (
                <RntButton
                  key={action.text}
                  className="max-sm_inverted:w-full h-16 px-4"
                  disabled={disableButton}
                  onClick={() => {
                    if (action.params == null || action.params.length == 0) {
                      changeStatusCallback(() => {
                        return action.action(BigInt(tripInfo.tripId), []);
                      });
                    } else {
                      handleButtonClick();
                    }
                  }}
                >
                  {action.text}
                </RntButton>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
