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
      <ChatLink tripId={tripInfo.tripId} asHost={isHost} t={t} />
      <TelLink phoneNumber={phoneNumber} t={t} />
    </>
  );
}

function ChatLink({ tripId, asHost, t }: { tripId: number; asHost: boolean; t: TFunction }) {
  const pathRoot = asHost ? "host" : "guest";

  return (
    <Link href={`/${pathRoot}/messages?tridId=${tripId}`}>
      <i className="fi fi-rs-envelope-open pr-1 text-rentality-icons"></i>
      <strong className="text-lg">{t("booked.chat")}</strong>
    </Link>
  );
}

function TelLink({ phoneNumber, t }: { phoneNumber: string; t: TFunction }) {
  const telLink = `tel:${phoneNumber}`;

  return (
    <a href={telLink}>
      <i className="fi fi-br-phone-flip pr-1 text-rentality-icons"></i>
      <strong className="text-lg">{t("booked.contact")}</strong>
    </a>
  );
}

export default memo(TripContacts);
