import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import { TripInfo } from "@/model/TripInfo";
import RntButton from "../common/rntButton";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import { Dispatch, SetStateAction, memo, useState, useRef } from "react";
import moment from "moment";
import { TripStatus } from "@/model/blockchain/schemas";
import { TFunction } from "i18next";
import { isEmpty } from "@/utils/string";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import ModifyTripForm from "./modifyTripForm";
import { useChat } from "@/features/chat/contexts/chatContext";
import GuestConfirmFinishForm from "./guestConfirmFinishForm";

function isInTheFuture(date: Date) {
  return date > new Date();
}

const getActionTextsForStatus = (tripInfo: TripInfo, isHost: boolean, isFinishingByHost: boolean, t: TFunction) => {
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
        ? t("booked.status_confirmed_host", {
            date: moment(tripInfo.tripStart).fromNow(),
            returnObjects: true,
          } as const)
        : t("booked.status_confirmed_guest", {
            date: moment(tripInfo.tripStart).fromNow(),
            returnObjects: true,
          } as const);
    case TripStatus.CheckedInByHost:
      if (isFinishingByHost) {
        return t("booked.status_is_finishing_by_host", { returnObjects: true } as const);
      }
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
      if (isFinishingByHost) {
        return t("booked.status_is_finishing_by_host", { returnObjects: true } as const);
      }
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
              date: moment(tripInfo.tripEnd).fromNow(),
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
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<boolean>;
  disableButton: boolean;
  isAdditionalActionHidden: boolean;
  setIsAdditionalActionHidden: Dispatch<SetStateAction<boolean>>;
  isHost: boolean;
  t: TFunction;
}) {
  const { showCustomDialog, hideDialogs } = useRntDialogs();
  const [messageToGuest, setMessageToGuest] = useState("");
  const [isFinishingByHost, setIsFinishingByHost] = useState(false);
  const { sendMessage, getMessages } = useChat();

  const [actionHeader, actionText, actionDescription] = getActionTextsForStatus(
    tripInfo,
    isHost,
    isFinishingByHost,
    t
  ) as string[];

  if (
    isEmpty(actionHeader) &&
    isEmpty(actionText) &&
    isEmpty(actionDescription) &&
    (!isAdditionalActionHidden || tripInfo.allowedActions.filter((i) => i.isDisplay).length === 0)
  )
    return <></>;

  const handleHostFinishTrip = async (messageToGuest: string): Promise<boolean> => {
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
        return savedAction(tripId, params, []);
      };
    }
    setIsFinishingByHost(true);
    setIsAdditionalActionHidden(false);
    return true;
  };

  const handleGuestFinishTrip = async () => {
    hideDialogs();

    return changeStatusCallback(() => {
      return tripInfo.allowedActions[0].action(BigInt(tripInfo.tripId), [], []);
    });
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
        tripId={tripInfo.tripId}
      />
    );
  };

  const showGuestConfirmFinishDialog = async () => {
    showCustomDialog(
      <GuestConfirmFinishForm
        handleFinishTrip={handleGuestFinishTrip}
        handleCancel={handleCancel}
        hostPhoneNumber={tripInfo.host.phoneNumber}
        messageFromHost={
          (await getMessages(tripInfo.tripId))
            .find((m) => m.message.startsWith("Host finished the trip without guest confirmation."))
            ?.message?.split("\n")[1] ?? ""
        }
        t={t}
        tripId={tripInfo.tripId}
      />
    );
  };

  return (
    <div id="trip-action-info" className="flex w-full flex-col justify-between max-md:mt-8">
      <div className="flex flex-col whitespace-pre-line">
        <p className="text-center text-rentality-secondary">{actionHeader}</p>
        <p className="mt-4 text-center text-lg">
          <strong>{actionText}</strong>
        </p>
        <p className="text-center text-sm md:mt-4">{actionDescription}</p>
      </div>

      {!isAdditionalActionHidden || tripInfo.allowedActions.length === 0 ? null : (
        <div className="mt-2 flex flex-col gap-4 sm:flex-row md:flex-col">
          {(tripInfo.status === TripStatus.CheckedInByHost || tripInfo.status === TripStatus.Started) && isHost ? (
            <RntButton
              className="w-full px-4"
              onClick={() => {
                showModifyTripDialog();
              }}
            >
              Modify trip
            </RntButton>
          ) : tripInfo.status === TripStatus.CompletedWithoutGuestComfirmation && isHost ? (
            <a className="w-full" href={`tel:${tripInfo.guest.phoneNumber}`}>
              <RntButton className="w-full px-4">Contact to guest</RntButton>
            </a>
          ) : tripInfo.status === TripStatus.CompletedWithoutGuestComfirmation && !isHost ? (
            <RntButton
              className="w-full px-4"
              disabled={disableButton}
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
                    className="w-full px-4"
                    disabled={disableButton}
                    onClick={() => {
                      if (action.params == null || action.params.length == 0) {
                        changeStatusCallback(() => {
                          return action.action(BigInt(tripInfo.tripId), [], []);
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
                    className="w-full px-4"
                    disabled={disableButton}
                    onClick={() => {
                      if (action.params == null || action.params.length == 0) {
                        changeStatusCallback(() => {
                          return action.action(BigInt(tripInfo.tripId), [], []);
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
