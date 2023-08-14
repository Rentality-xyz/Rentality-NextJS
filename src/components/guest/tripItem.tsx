import Image from "next/image";
import Link from "next/link";
import { dateFormat } from "@/utils/datetimeFormatters";
import {
  TripInfo,
  TripStatus,
  getTripStatusTextFromStatus,
} from "@/model/TripInfo";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import RntButton from "../common/rntButton";
import AllowedActionsForStatusStarted from "./allowedActionsForStatusStarted";
import AllowedActions from "./allowedActions";

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
    "absolute right-0 top-2 px-8 py-2 rounded-l-3xl bg-purple-600 text-rnt-temp-status-text text-end",
    statusBgColor
  );

  return (
    <div className="rnt-card flex flex-col rounded-xl overflow-hidden">
      <div className="flex flex-wrap">
        {/* <div className="relative h-56 w-60 flex-shrink-0">
          <Image
            src={tripInfo.image}
            alt=""
            width={1000}
            height={1000}
            className="h-full w-full object-cover"
          /> */}
        <div
          style={{ backgroundImage: `url(${tripInfo.image})` }}
          className="relative w-64 min-h-[12rem] flex-shrink-0 bg-center bg-cover"
        >
          <div className={statusClassName}>
            <strong className="text-m">{`${getTripStatusTextFromStatus(
              tripInfo.status
            )}`}</strong>
            {tripInfo.status === TripStatus.CheckedOutByGuest ? (
              <div className="text-black text-xs">
                Pending finish by host and deposit refund
              </div>
            ) : null}
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
          {tripInfo.status === TripStatus.Started ? (
            <AllowedActionsForStatusStarted
              tripInfo={tripInfo}
              params={tripInfo.allowedActions[0].params}
              inputParams={inputParams}
              setInputParams={setInputParams}
            />
          ) : (
            <AllowedActions
              tripInfo={tripInfo}
              inputParams={inputParams}
              setInputParams={setInputParams}
              confirmParams={confirmParams}
              setConfirmParams={setConfirmParams}
            />
          )}

          <div className="flex flex-row gap-4">
            {tripInfo.allowedActions.map((action) => {
              return (
                <RntButton
                  key={action.text}
                  className="h-16 px-4"
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
