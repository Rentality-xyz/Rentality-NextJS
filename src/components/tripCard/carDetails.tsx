import { dateFormatShortMonthDate } from "@/utils/datetimeFormatters";
import { TripInfo } from "@/model/TripInfo";
import UserAvatarWithName from "@/components/common/userAvatarWithName";
import { memo } from "react";
import { TripStatus } from "@/model/blockchain/schemas";
import { TFunction } from "@/utils/i18n";
import Link from "next/link";

function СarDetails({
  tripInfo,
  isHost,
  t,
  showMoreInfo,
}: {
  tripInfo: TripInfo;
  isHost: boolean;
  t: TFunction;
  showMoreInfo: boolean;
}) {
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

  const pathRoot = isHost ? "host" : "guest";
  const otherUserPhoneNumber = isHost ? tripInfo.guest.phoneNumber : tripInfo.host.phoneNumber;

  return (
    <div id="trip-main-info" className="w-full md:w-1/4 flex flex-1 flex-col gap-4 justify-between p-4 md:p-2 xl:p-4">
      <div className="flex flex-col">
        <div>
          <strong className="text-xl">{`${tripInfo.brand} ${tripInfo.model} ${tripInfo.year}`}</strong>
        </div>
        <div>{!showMoreInfo ? t("common.plate_number") + ": " + tripInfo.licensePlate : tripInfo.licensePlate}</div>
        {!showMoreInfo ? (
          <div>
            {t("vehicles.state")}: {tripInfo.licenseState}
          </div>
        ) : (
          <></>
        )}
        {tripInfo.status === TripStatus.Rejected && tripInfo.rejectedDate !== undefined ? (
          <div className="mt-2">
            {t("booked.cancelled_on", {
              rejected: rejectedByText,
              date: dateFormatShortMonthDate(tripInfo.rejectedDate),
            })}
          </div>
        ) : null}
        {showMoreInfo ? (
          <div className="flex flex-col mt-4">
            <div>
              <strong className="text-l">{t("booked.total")}</strong>
            </div>
            <div>${tripInfo.totalDayPriceInUsd}</div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <UserAvatarWithName
        photoUrl={otherUserPhotoUrl}
        userName={otherUserName}
        label={isHost ? "YOUR GUEST" : "HOSTED BY"}
      />
      {!showMoreInfo ? (
        <div className="2xl:flex 2xl:flex-row">
          <div id="trip-chat-info">
            <div className="me-2">
              <Link href={`/${pathRoot}/messages?tridId=${tripInfo.tripId}`}>
                <i className="fi fi-rs-envelope-open pr-1 text-rentality-icons"></i>
                <strong className="text-l">{t("booked.chat")}</strong>
              </Link>
            </div>
          </div>
          <div id="trip-contact-info">
            <div>
              <a href={`tel:${otherUserPhoneNumber}`}>
                <i className="fi fi-br-phone-flip pr-1 text-rentality-icons"></i>
                <strong className="text-l">{t("booked.contact")}</strong>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default memo(СarDetails);
