import Link from "next/link";
import { dateFormat, dateFormatDayMonthTime, dateFormatMonthDate } from "@/utils/datetimeFormatters";
import { ElementRef, useEffect, useRef, useState } from "react";
import {
  TripInfo,
  TripStatus,
  getRefuelValueAndCharge,
  getTripStatusBgColorClassFromStatus,
  getTripStatusTextFromStatus,
} from "@/model/TripInfo";
import Checkbox from "../common/checkbox";
import { calculateDays } from "@/utils/date";
import { twMerge } from "tailwind-merge";
import RntSelect from "../common/rntSelect";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";

export default function TripItem({
  tripInfo,
  changeStatusCallback,
  disableButton,
}: {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
  disableButton: boolean;
}) {
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
  const allowedActionsRef = useRef<ElementRef<"div">>(allowedActions);
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
  const { refuelValue, refuelCharge } = getRefuelValueAndCharge(tripInfo, tripInfo.endFuelLevelInPercents);

  const tripDays = calculateDays(tripInfo.tripStart, tripInfo.tripEnd);
  var overmileValue = tripInfo.endOdometr - tripInfo.startOdometr - tripInfo.milesIncludedPerDay * tripDays;
  overmileValue = overmileValue > 0 ? overmileValue : 0;

  return (
    <div className="rnt-card flex flex-col rounded-xl overflow-hidden bg-rentality-bg">
      <div className="sm_inverted:flex max-2xl:flex-wrap 2xl:flex-nowrap">
        {/* <div className="relative h-56 w-60 flex-shrink-0">
          <Image
            src={tripInfo.image}
            alt=""
            width={1000}
            height={1000}
            className="h-full w-full object-cover"
          /> */}

        {/* Empty span to generate tailwind css colors for statuses */}
        <span className="bg-yellow-600 bg-lime-500 bg-blue-600 bg-blue-800 bg-purple-600 bg-purple-800 bg-fuchsia-700 bg-red-500" />
        <div
          style={{ backgroundImage: `url(${tripInfo.image})` }}
          className="relative w-full 1xl:w-64 min-h-[12rem] md:min-h-[16rem] xl:min-h-[12rem] flex-shrink-0 bg-center bg-cover"
        >
          <div className={statusClassName}>
            <strong className="text-m">{`${getTripStatusTextFromStatus(tripInfo.status)}`}</strong>
          </div>
        </div>

        <div id="host-trip-item-info" className="w-full flex flex-col sm_inverted:flex-row">
          <div id="host-trip-main-info" className="w-full sm_inverted:w-1/4 flex flex-1 flex-col p-4 md:p-2 xl:p-4">
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
          </div>
          <div
            id="host-trip-action-info"
            className="w-full sm_inverted:w-1/4 flex flex-1 flex-col justify-between gap-2 p-4 md:p-2 xl:p-4"
          >
            <div className="flex flex-col">
              <div className="text-center text-[#52D1C9]">
                <strong>Guest booked a trip at {dateFormatDayMonthTime(tripInfo.createdDateTime)}</strong>
              </div>
              <div className="mt-4 text-center">
                {/* `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` */}
                You have 1 hour to confirm this trip or it&apos;ll auto-reject
              </div>
            </div>

            {!isAdditionalActionHidden ? null : (
              <div className="flex max-sm_inverted:flex-row flex-col 2xl:flex-row gap-4">
                {tripInfo.allowedActions.map((action, index) => {
                  return index === 0 ? (
                    <RntButton
                      key={action.text}
                      className="h-12 w-full px-4"
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
                  ) : (
                    <RntButtonTransparent
                      key={action.text}
                      className="h-12 w-full px-4"
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
                    </RntButtonTransparent>
                  );
                })}
              </div>
            )}
          </div>
          <div
            id="host-trip-info"
            className="w-full sm_inverted:w-1/4 flex flex-1 flex-col gap-2 p-4 md:p-2 xl:p-4 2xl:ml-14"
          >
            <div className="flex flex-col 2xl:mt-6">
              <div>
                <i className="fi fi-rs-calendar pr-1  text-rentality-icons"></i>
                <strong className="text-l">Trip start</strong>
              </div>
              <div className="whitespace-nowrap">{dateFormat(tripInfo.tripStart)}</div>
            </div>
            <div className="flex flex-col 2xl:mt-4">
              <div>
                <i className="fi fi-rs-calendar pr-1  text-rentality-icons"></i>
                <strong className="text-l">Trip end</strong>
              </div>
              <div className="whitespace-nowrap">{dateFormat(tripInfo.tripEnd)}</div>
            </div>
          </div>
          <div id="host-trip-location-info" className="w-full sm_inverted:w-1/4 flex flex-col flex-1 p-4 md:p-2 xl:p-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col 2xl:mt-6">
                <div>
                  <i className="fi fi-rs-marker pr-1  text-rentality-icons"></i>
                  <strong className="text-l whitespace-nowrap">Pickup location</strong>
                </div>
                <p>{tripInfo.locationStart}&nbsp;</p>
                {/* <div>Miami, CA, USA</div> */}
              </div>
              <div className="flex flex-col 2xl:mt-4">
                <div>
                  <i className="fi fi-rs-marker pr-1 text-rentality-icons"></i>
                  <strong className="text-l whitespace-nowrap">Return location</strong>
                </div>
                <p>{tripInfo.locationEnd}&nbsp;</p>
                {/* <div>Miami, CA, USA</div> */}
              </div>
            </div>
          </div>
        </div>
        <div
          id="trip-contact-info"
          className="max-2xl:w-full 2xl:w-46 flex flex-col 2xl:flex-shrink-0 p-4 md:p-2 xl:p-4 text-end"
        >
          <div className="flex max-2xl:justify-between 2xl:flex-col 2xl:gap-2 2xl:pr-8">
            <div id="trip-chat-info" className="2xl:flex 2xl:flex-col 2xl:mt-6">
              <div>
                <Link href={`/host/messages?tridId=${tripInfo.tripId}`}>
                  <i className="fi fi-rs-envelope-open pr-1 text-rentality-icons"></i>
                  <strong className="text-l">Chat</strong>
                </Link>
              </div>
            </div>
            <div id="trip-contact-info" className="2xl:flex 2xl:flex-col 2xl:mt-2">
              <div>
                <a href={`tel:${tripInfo.guestMobileNumber}`}>
                  <i className="fi fi-br-phone-flip pr-1 text-rentality-icons"></i>
                  <strong className="text-l">Contact</strong>
                </a>
              </div>
            </div>
            <div className="2xl:mt-10 text-[#52D1C9]">
              <Link href={`/host/trips/tripInfo/${tripInfo.tripId}`}>
                <strong>More info</strong>
              </Link>
              <i className="fi fi-br-angle-small-down pl-1"></i>
            </div>
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
          <div id="host-trip-allowed-actions">
            <strong className="text-xl">
              Please {tripInfo.allowedActions[0].readonly ? "confirm" : "enter"} data to change status:
            </strong>
          </div>

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
                        <span>Refuel:</span>
                        <span>{refuelValue} gal</span>
                        <span>Gal price:</span>
                        <span>${tripInfo.fuelPricePerGal.toFixed(2)}</span>
                        <span>Refuel or battery charge:</span>
                        <span>${refuelCharge.toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="md:w-1/2 xl:w-1/4 md:mx-8 xl:mx-28 grid grid-cols-2 text-sm">
                        <span className="font-bold col-span-2">Reimbursement charge:</span>
                        <span>Overmiles:</span>
                        <span>{overmileValue}</span>
                        <span>Overmile price:</span>
                        <span>${tripInfo.overmilePrice.toFixed(4)}</span>
                        <span>Overmile charge:</span>
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
