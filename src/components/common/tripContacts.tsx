import Link from "next/link";
import { TripInfo } from "@/model/TripInfo";
import { memo } from "react";
import { TFunction } from "@/utils/i18n";

function TripContacts({
  tripInfo,
  isHost,
  phoneForHost,
  t,
}: {
  tripInfo: TripInfo;
  isHost: boolean;
  phoneForHost?: boolean;
  t: TFunction;
}) {
  let phoneNumber;

  if (phoneForHost !== undefined) {
    phoneNumber = phoneForHost ? tripInfo.host.phoneNumber : tripInfo.guest.phoneNumber;
  } else {
    let otherPhoneNumber = isHost ? tripInfo.guest.phoneNumber : tripInfo.host.phoneNumber;
    phoneNumber = otherPhoneNumber;
  }

  return (
    <>
      <div className="2xl:mt-6 2xl:flex 2xl:flex-col">
        <ChatLink tripId={tripInfo.tripId} asHost={isHost} t={t} />
      </div>
      <div className="2xl:mt-2 2xl:flex 2xl:flex-col">
        <TelLink phoneNumber={phoneNumber} t={t} />
      </div>
    </>
  );
}

function ChatLink({ tripId, asHost, t }: { tripId: number; asHost: boolean; t: TFunction }) {
  const pathRoot = asHost ? "host" : "guest";

  return (
    <Link href={`/${pathRoot}/messages?tridId=${tripId}`}>
      <i className="fi fi-rs-envelope-open pr-1 text-rentality-icons"></i>
      <strong className="text-l">{t("booked.chat")}</strong>
    </Link>
  );
}

function TelLink({ phoneNumber, t }: { phoneNumber: string; t: TFunction }) {
  const telLink = `tel:${phoneNumber}`;

  return (
    <a href={telLink}>
      <i className="fi fi-br-phone-flip pr-1 text-rentality-icons"></i>
      <strong className="text-l">{t("booked.contact")}</strong>
    </a>
  );
}

export default memo(TripContacts);
