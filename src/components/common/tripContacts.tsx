import Link from "next/link";
import { TripInfo } from "@/model/TripInfo";
import { memo } from "react";
import { TFunction } from "@/utils/i18n";

function TripContacts({ tripInfo, isHost, t }: { tripInfo: TripInfo; isHost: boolean; t: TFunction }) {
  const pathRoot = isHost ? "host" : "guest";
  const otherUserPhoneNumber = isHost ? tripInfo.guest.phoneNumber : tripInfo.host.phoneNumber;

  return (
    <>
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
    </>
  );
}

export default memo(TripContacts);