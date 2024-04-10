import { dateFormatShortMonthDate } from "@/utils/datetimeFormatters";
import { TripInfo } from "@/model/TripInfo";
import UserAvatarWithName from "./userAvatarWithName";
import { memo } from "react";
import { TripStatus } from "@/model/blockchain/schemas";
import { TFunction } from "@/pages/i18n";

function СarDetails({ tripInfo, isHost, t }: { tripInfo: TripInfo; isHost: boolean; t: TFunction }) {
  const rejectedByHost = tripInfo.rejectedBy.toLowerCase() === tripInfo.hostAddress.toLowerCase();
  const rejectedByText = rejectedByHost
    ? isHost
      ? t("common.you")
      : tripInfo.hostName ?? t("common.host")
    : isHost
      ? tripInfo.guestName ?? t("common.guest")
      : t("common.you");
  const otherUserPhotoUrl = isHost ? tripInfo.guestPhotoUrl : tripInfo.hostPhotoUrl;
  const otherUserName = isHost ? tripInfo.guestName : tripInfo.hostName;

  return (
    <div
      id="trip-main-info"
      className="w-full sm_inverted:w-1/4 flex flex-1 flex-col gap-4 justify-between p-4 md:p-2 xl:p-4"
    >
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
        <div className="flex flex-col mt-4">
          <div>
            <strong className="text-l">{t("booked.total")}</strong>
          </div>
          <div>${tripInfo.totalPrice}</div>
        </div>
      </div>
      <UserAvatarWithName photoUrl={otherUserPhotoUrl} userName={otherUserName} isHost={isHost} />
    </div>
  );
}

export default memo(СarDetails);
