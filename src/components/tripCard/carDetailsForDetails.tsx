import { dateFormatShortMonthDate } from "@/utils/datetimeFormatters";
import { TripInfo } from "@/model/TripInfo";
import UserAvatarWithName from "@/components/common/userAvatarWithName";
import { memo } from "react";
import { TripStatus } from "@/model/blockchain/schemas";
import { TFunction } from "@/utils/i18n";
import Link from "next/link";

function СarDetailsForDetails({ tripInfo, isHost, t }: { tripInfo: TripInfo; isHost: boolean; t: TFunction }) {
  const rejectedByHost = tripInfo.rejectedBy.toLowerCase() === tripInfo.host.walletAddress.toLowerCase();
  const rejectedByText = rejectedByHost
    ? isHost
      ? t("common.you")
      : tripInfo.host.name ?? t("common.host")
    : isHost
      ? tripInfo.guest.name ?? t("common.guest")
      : t("common.you");

  const pathRoot = isHost ? "host" : "guest";
  const hostPhoneNumberLink = `tel:${tripInfo.host.phoneNumber}`;

  return (
    <div id="trip-main-info" className="flex w-full flex-1 flex-col justify-between gap-4 p-4 md:w-1/4 md:p-2 xl:p-4">
      <div className="flex flex-col">
        <div>
          <strong className="text-xl">{`${tripInfo.brand} ${tripInfo.model} ${tripInfo.year}`}</strong>
        </div>
        <div>{t("common.plate_number") + ": " + tripInfo.licensePlate}</div>
        <div>
          {t("vehicles.state")}: {tripInfo.licenseState}
        </div>
        {tripInfo.status === TripStatus.Rejected && tripInfo.rejectedDate !== undefined ? (
          <div className="mt-2">
            {t("booked.cancelled_on", {
              rejected: rejectedByText,
              date: dateFormatShortMonthDate(tripInfo.rejectedDate),
            })}
          </div>
        ) : null}
      </div>
      <div className="flex flex-row justify-between">
        <UserAvatarWithName
          photoUrl={tripInfo.host.photoUrl}
          userName={tripInfo.host.name}
          label={isHost ? "YOUR GUEST" : "HOSTED BY"}
        />
      </div>
      <div className="2xl:flex 2xl:flex-row">
        <div>
          <div className="me-2">
            <Link href={`/${pathRoot}/messages?tridId=${tripInfo.tripId}`}>
              <i className="fi fi-rs-envelope-open pr-1 text-rentality-icons"></i>
              <strong className="text-lg">{t("booked.chat")}</strong>
            </Link>
          </div>
        </div>
        <div>
          <div>
            <a href={hostPhoneNumberLink}>
              <i className="fi fi-br-phone-flip pr-1 text-rentality-icons"></i>
              <strong className="text-lg">{t("booked.contact")}</strong>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(СarDetailsForDetails);
