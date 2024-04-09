import Link from "next/link";
import { TripInfo } from "@/model/TripInfo";
import { memo } from "react";
import { TFunction } from "@/pages/i18n";

function TripContacts({ tripInfo, isHost, t }: { tripInfo: TripInfo; isHost: boolean; t: TFunction }) {
  const pathRoot = isHost ? "host" : "guest";
  const otherUserPhoneNumber = isHost ? tripInfo.guestPhoneNumber : tripInfo.hostPhoneNumber;

  return (
    <div
      id="trip-contact-info"
      className="max-2xl:w-full 2xl:w-46 flex flex-col 2xl:flex-shrink-0 p-4 md:p-2 xl:p-4 text-end"
    >
      <div className="flex max-2xl:justify-between 2xl:flex-col 2xl:gap-2 2xl:pr-8">
        <div id="trip-chat-info" className="2xl:flex 2xl:flex-col 2xl:mt-6">
          <div>
            <Link href={`/${pathRoot}/messages?tridId=${tripInfo.tripId}`}>
              <i className="fi fi-rs-envelope-open pr-1 text-rentality-icons"></i>
              <strong className="text-l">{t("booked.chat")}</strong>
            </Link>
          </div>
        </div>
        <div id="trip-contact-info" className="2xl:flex 2xl:flex-col 2xl:mt-2">
          <div>
            <a href={`tel:${otherUserPhoneNumber}`}>
              <i className="fi fi-br-phone-flip pr-1 text-rentality-icons"></i>
              <strong className="text-l">{t("booked.contact")}</strong>
            </a>
          </div>
        </div>
        <div className="2xl:mt-10 text-[#52D1C9]">
          <Link href={`/${pathRoot}/trips/tripInfo/${tripInfo.tripId}`}>
            <strong>{t("booked.more_info")}</strong>
          </Link>
          <i className="fi fi-br-angle-small-down pl-1"></i>
        </div>
      </div>
    </div>
  );
}

export default memo(TripContacts);
