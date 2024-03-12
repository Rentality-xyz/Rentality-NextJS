import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import { TripInfo } from "@/model/TripInfo";
import RntButton from "../common/rntButton";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import { Dispatch, SetStateAction, memo } from "react";
import moment from "moment";
import { TripStatus } from "@/model/blockchain/schemas";

const getActionTextsForStatus = (tripInfo: TripInfo, isHost: boolean) => {
  switch (tripInfo.status) {
    case TripStatus.Pending:
      return isHost
        ? ([
            `Guest booked a trip at ${dateFormatShortMonthDateTime(tripInfo.createdDateTime, tripInfo.timeZoneId)}`,
            "",
            "You have 1 hour to confirm this trip or it'll auto-reject",
          ] as const)
        : (["Host will confirm within 1 hour", "", "Wait host confirmation or you can cancel free of charge"] as const);
    case TripStatus.Confirmed:
      return isHost
        ? ([
            `The trip starts in 1 hour`,
            "Let`s you check-in!",
            "Start the trip from your side and wait start from the Guest.",
          ] as const)
        : ([
            `The host confirmed your trip The trip starts in 1 hour`,
            "",
            "Please wait for the host start a trip or you can cancel with cancelation fee 50% of the daily rate",
          ] as const);
    case TripStatus.CheckedInByHost:
      return isHost
        ? (["", "", ""] as const)
        : ([
            `Checked-in by Host at ${dateFormatShortMonthDateTime(
              tripInfo.checkedInByHostDateTime,
              tripInfo.timeZoneId
            )}`,
            "Let`s you check-in!",
            "Start the trip from your side or you can cancel with cancelation fee 100% of the daily rate",
          ] as const);
    case TripStatus.Started:
      return isHost
        ? ([
            `Now on the trip. The trip ends ${
              tripInfo.tripEnd > new Date() ? moment(tripInfo.tripEnd).toNow() : moment(tripInfo.tripEnd).fromNow()
            }`,
            "",
            "Wait for the Guest to finish the trip first and then complete on your sides",
          ] as const)
        : ([
            `The trip ends ${
              tripInfo.tripEnd > new Date() ? moment(tripInfo.tripEnd).toNow() : moment(tripInfo.tripEnd).fromNow()
            }`,
            "Let`s you check-out!",
            "Finish the trip from your side and wait finish from the Host.",
          ] as const);
    case TripStatus.CheckedOutByGuest:
      return isHost
        ? ([
            `Checked-out by Guest at ${dateFormatShortMonthDateTime(
              tripInfo.checkedOutByGuestDateTime,
              tripInfo.timeZoneId
            )}`,
            "Let`s you check-out!",
            "Finish the trip from your side and then Complete the order",
          ] as const)
        : (["", "", ""] as const);
    case TripStatus.Finished:
      return isHost
        ? ([
            `You finish the trip at ${dateFormatShortMonthDateTime(
              tripInfo.checkedOutByHostDateTime,
              tripInfo.timeZoneId
            )}`,
            "Please complete the order!",
            "You receive payment and guest's deposit refunded.",
          ] as const)
        : (["", "", ""] as const);
    case TripStatus.Closed:
      return isHost ? (["", "", ""] as const) : (["", "", ""] as const);
    case TripStatus.Rejected:
    default:
      return isHost ? (["", "", ""] as const) : (["", "", ""] as const);
  }
};

function CurrentStatusInfo({
  tripInfo,
  changeStatusCallback,
  disableButton,
  isAdditionalActionHidden,
  setIsAdditionalActionHidden,
  isHost,
}: {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
  disableButton: boolean;
  isAdditionalActionHidden: boolean;
  setIsAdditionalActionHidden: Dispatch<SetStateAction<boolean>>;
  isHost: boolean;
}) {
  const [actionHeader, actionText, actionDescription] = getActionTextsForStatus(tripInfo, isHost);
  return (
    <div
      id="trip-action-info"
      className="w-full sm_inverted:w-1/4 flex flex-1 flex-col justify-between gap-2 p-4 md:p-2 xl:p-4"
    >
      <div className="flex flex-col">
        <p className="text-center text-[#52D1C9]">{actionHeader}</p>
        <p className="mt-4 text-center text-lg">
          <strong>{actionText}</strong>
        </p>
        <p className="mt-4 text-center text-sm">{actionDescription}</p>
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
  );
}

export default memo(CurrentStatusInfo);
