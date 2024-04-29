import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import { TripInfo } from "@/model/TripInfo";
import RntButton from "../common/rntButton";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import { Dispatch, SetStateAction, memo, useState } from "react";
import moment from "moment";
import { TripStatus } from "@/model/blockchain/schemas";
import { TFunction } from "i18next";
import { isEmpty } from "@/utils/string";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import ModifyTripForm from "./modifyTripForm";
import { useChat } from "@/contexts/chatContext";
import GuestConfirmFinishForm from "./guestConfirmFinishForm";
import { bigIntReplacer } from "@/utils/json";

function isInTheFuture(date: Date) {
  return date > new Date();
}

const getActionTextsForStatus = (tripInfo: TripInfo, isHost: boolean, t: TFunction) => {
  switch (tripInfo.status) {
    case TripStatus.Pending:
      return isHost
        ? t("booked.status_pending_host", {
            date: dateFormatShortMonthDateTime(tripInfo.createdDateTime, tripInfo.timeZoneId),
            returnObjects: true,
          } as const)
        : t("booked.status_pending_guest", { returnObjects: true });
    case TripStatus.Confirmed:
      return isHost
        ? t("booked.status_confirmed_host", { returnObjects: true } as const)
        : t("booked.status_confirmed_guest", { returnObjects: true } as const);
    case TripStatus.CheckedInByHost:
      return isHost
        ? t("booked.status_check_in_host_host", {
            date: dateFormatShortMonthDateTime(tripInfo.checkedInByHostDateTime, tripInfo.timeZoneId),
            returnObjects: true,
          } as const)
        : t("booked.status_check_in_host_guest", {
            date: dateFormatShortMonthDateTime(tripInfo.checkedInByHostDateTime, tripInfo.timeZoneId),
            returnObjects: true,
          } as const);
    case TripStatus.Started:
      return isHost
        ? t(
            isInTheFuture(tripInfo.tripEnd)
              ? "booked.status_trip_started_host_ends"
              : "booked.status_trip_started_host_ended",
            {
              startDate: dateFormatShortMonthDateTime(tripInfo.checkedInByGuestDateTime, tripInfo.timeZoneId),
              date: isInTheFuture(tripInfo.tripEnd)
                ? moment(tripInfo.tripEnd).fromNow()
                : moment(tripInfo.tripEnd).toNow(),
              returnObjects: true,
            } as const
          )
        : t(
            isInTheFuture(tripInfo.tripEnd)
              ? "booked.status_trip_started_guest_ends"
              : "booked.status_trip_started_guest_ended",
            {
              date: isInTheFuture(tripInfo.tripEnd)
                ? moment(tripInfo.tripEnd).fromNow()
                : moment(tripInfo.tripEnd).toNow(),
              returnObjects: true,
            } as const
          );

    case TripStatus.CheckedOutByGuest:
      return isHost
        ? t("booked.status_check_out_by_guest", {
            date: dateFormatShortMonthDateTime(tripInfo.checkedOutByGuestDateTime, tripInfo.timeZoneId),
            returnObjects: true,
          } as const)
        : (["", "", ""] as const);
    case TripStatus.CompletedWithoutGuestComfirmation:
      return isHost
        ? t("booked.status_completed_without_guest_host", {
            date: dateFormatShortMonthDateTime(tripInfo.checkedOutByHostDateTime, tripInfo.timeZoneId),
            returnObjects: true,
          } as const)
        : t("booked.status_completed_without_guest_guest", {
            date: dateFormatShortMonthDateTime(tripInfo.checkedOutByHostDateTime, tripInfo.timeZoneId),
            returnObjects: true,
          } as const);
    case TripStatus.Finished:
      return isHost
        ? t("booked.status_finished", {
            date: dateFormatShortMonthDateTime(tripInfo.checkedOutByHostDateTime, tripInfo.timeZoneId),
            returnObjects: true,
          } as const)
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
  t,
}: {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
  disableButton: boolean;
  isAdditionalActionHidden: boolean;
  setIsAdditionalActionHidden: Dispatch<SetStateAction<boolean>>;
  isHost: boolean;
  t: TFunction;
}) {
  const [actionHeader, actionText, actionDescription] = getActionTextsForStatus(tripInfo, isHost, t) as string[];
  const { showCustomDialog, hideDialogs } = useRntDialogs();
  const [messageToGuest, setMessageToGuest] = useState("");
  const { chatInfos, sendMessage } = useChat();

  if (
    isEmpty(actionHeader) &&
    isEmpty(actionText) &&
    isEmpty(actionDescription) &&
    (!isAdditionalActionHidden || tripInfo.allowedActions.filter((i) => i.isDisplay).length === 0)
  )
    return <></>;

  const handleHostFinishTrip = async (messageToGuest: string) => {
    hideDialogs();
    setMessageToGuest(messageToGuest);
    if (tripInfo.allowedActions.length > 0) {
      tripInfo.allowedActions[0].isDisplay = true;
      const savedAction = tripInfo.allowedActions[0].action;
      const sendMessageToGuest = async () => {
        const messageToSend = `Host finished the trip without guest confirmation.\n${messageToGuest}\nPlease confirm finish trip or contact me if you have any questions.`;
        await sendMessage(tripInfo.guest.walletAddress, tripInfo.tripId, messageToSend);
      };
      tripInfo.allowedActions[0].action = async (tripId: bigint, params: string[]) => {
        await sendMessageToGuest();
        return savedAction(tripId, params);
      };
    }
    setIsAdditionalActionHidden(false);
  };

  const handleGuestFinishTrip = async () => {
    hideDialogs();
    if (tripInfo.allowedActions.length > 0) {
      await tripInfo.allowedActions[0].action(BigInt(tripInfo.tripId), []);
    }
  };

  const handleCancel = () => {
    hideDialogs();
  };

  const showModifyTripDialog = () => {
    showCustomDialog(
      <ModifyTripForm
        handleFinishTrip={handleHostFinishTrip}
        handleCancel={handleCancel}
        guestPhoneNumber={tripInfo.guest.phoneNumber}
        t={t}
      />
    );
  };

  const showGuestConfirmFinishDialog = () => {
    showCustomDialog(
      <GuestConfirmFinishForm
        handleFinishTrip={handleGuestFinishTrip}
        handleCancel={handleCancel}
        hostPhoneNumber={tripInfo.host.phoneNumber}
        messageFromHost={
          chatInfos
            .find((i) => i.tripId === tripInfo.tripId)
            ?.messages?.find((m) => m.message.startsWith("Host finished the trip without guest confirmation."))
            ?.message?.split("\n")[0] ?? ""
        }
        t={t}
      />
    );
  };

  return (
    <div
      id="trip-action-info"
      className="w-full sm_inverted:w-1/4 flex flex-1 flex-col justify-between gap-2 p-4 md:p-2 xl:p-4"
    >
      <div className="flex flex-col whitespace-pre-line">
        <p className="text-center text-[#52D1C9]">{actionHeader}</p>
        <p className="mt-4 text-center text-lg">
          <strong>{actionText}</strong>
        </p>
        <p className="mt-4 text-center text-sm">{actionDescription}</p>
      </div>

      {!isAdditionalActionHidden ? null : (
        <div className="flex max-sm_inverted:flex-row flex-col 2xl:flex-row gap-4">
          {(tripInfo.status === TripStatus.Started || tripInfo.status === TripStatus.CheckedInByHost) && isHost ? (
            <RntButton
              className="h-12 w-full px-4"
              onClick={() => {
                showModifyTripDialog();
              }}
            >
              Modify trip
            </RntButton>
          ) : tripInfo.status === TripStatus.CompletedWithoutGuestComfirmation && isHost ? (
            <a className="w-full" href={`tel:${tripInfo.guest.phoneNumber}`}>
              <RntButton className="h-12 w-full px-4">Contact to guest</RntButton>
            </a>
          ) : tripInfo.status === TripStatus.CompletedWithoutGuestComfirmation && !isHost ? (
            <RntButton
              className="h-12 w-full px-4"
              onClick={() => {
                showGuestConfirmFinishDialog();
              }}
            >
              I confirm finish trip
            </RntButton>
          ) : (
            tripInfo.allowedActions
              .filter((i) => i.isDisplay)
              .map((action, index) => {
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
              })
          )}
        </div>
      )}
    </div>
  );
}

export default memo(CurrentStatusInfo);
