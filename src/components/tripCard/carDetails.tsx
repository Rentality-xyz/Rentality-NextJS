import { dateFormatShortMonthDate } from "@/utils/datetimeFormatters";
import { TripInfo } from "@/model/TripInfo";
import UserAvatarWithName from "@/components/common/userAvatarWithName";
import { memo } from "react";
import { TripStatus } from "@/model/blockchain/schemas";
import { TFunction } from "@/utils/i18n";
import RntButtonTransparent from "../common/rntButtonTransparent";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import CarDetailsVerificationDialog from "./CarDetailsVerificationDialog";

function СarDetails({
  tripInfo,
  isHost,
  t,
  confirmCarDetails,
}: {
  tripInfo: TripInfo;
  isHost: boolean;
  t: TFunction;
  confirmCarDetails?: (tridId: number) => Promise<void>;
}) {
  const { showCustomDialog, hideDialogs } = useRntDialogs();

  const rejectedByHost = tripInfo.rejectedBy.toLowerCase() === tripInfo.host.walletAddress.toLowerCase();
  const rejectedByText = rejectedByHost
    ? isHost
      ? t("common.you")
      : tripInfo.host.name ?? t("common.host")
    : isHost
      ? tripInfo.guest.name ?? t("common.guest")
      : t("common.you");
  const otherUserPhotoUrl = isHost ? tripInfo.guest.photoUrl : tripInfo.host.photoUrl;
  const otherUserName = isHost ? tripInfo.guest.name : tripInfo.host.name;

  const handleConfirmCarDetailsClick = async () => {
    if (!confirmCarDetails) {
      console.error("handleConfirmCarDetailsClick error: confirmCarDetails is undefined");
      return;
    }

    showCustomDialog(
      <CarDetailsVerificationDialog
        handleConfirmCarDetailsClick={async () => {
          await confirmCarDetails(tripInfo.tripId);
          hideDialogs();
        }}
        handleCancelClick={hideDialogs}
      />
    );
  };

  return (
    <div id="trip-main-info" className="flex w-full flex-1 flex-col justify-between gap-4 p-4 md:w-1/4 md:p-2 xl:p-4">
      <div className="flex flex-col">
        <div>
          <strong className="text-xl">{`${tripInfo.brand} ${tripInfo.model} ${tripInfo.year}`}</strong>
        </div>
        <div>{tripInfo.licensePlate}</div>
        {tripInfo.status === TripStatus.Rejected && tripInfo.rejectedDate !== undefined ? (
          <div className="mt-2">
            {t("booked.cancelled_on", {
              rejected: rejectedByText,
              date: dateFormatShortMonthDate(tripInfo.rejectedDate),
            })}
          </div>
        ) : null}
        <div className="mt-4 flex flex-col">
          <div>
            <strong className="text-lg">{t("booked.total")}</strong>
          </div>
          <div>${tripInfo.totalDayPriceInUsd}</div>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <UserAvatarWithName
          photoUrl={otherUserPhotoUrl}
          userName={otherUserName}
          label={isHost ? "YOUR GUEST" : "HOSTED BY"}
        />

        {tripInfo.status === TripStatus.Closed && !tripInfo.isCarDetailsConfirmed && confirmCarDetails && (
          <RntButtonTransparent
            className="mr-8 flex h-12 w-12 flex-row items-center justify-center gap-2"
            onClick={handleConfirmCarDetailsClick}
          >
            <i className="fi fi-br-hexagon-check pt-2 text-3xl text-green-500"></i>
          </RntButtonTransparent>
        )}
      </div>
    </div>
  );
}

export default memo(СarDetails);
