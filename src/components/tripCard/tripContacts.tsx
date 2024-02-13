import Link from "next/link";
import { TripInfo } from "@/model/TripInfo";

export default function TripContacts({ tripInfo, isHost }: { tripInfo: TripInfo; isHost: boolean }) {
  const pathRoot = isHost ? "host" : "guest";
  const otherUserMobileNumber = isHost ? tripInfo.guestMobileNumber : tripInfo.hostMobileNumber;

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
              <strong className="text-l">Chat</strong>
            </Link>
          </div>
        </div>
        <div id="trip-contact-info" className="2xl:flex 2xl:flex-col 2xl:mt-2">
          <div>
            <a href={`tel:${otherUserMobileNumber}`}>
              <i className="fi fi-br-phone-flip pr-1 text-rentality-icons"></i>
              <strong className="text-l">Contact</strong>
            </a>
          </div>
        </div>
        <div className="2xl:mt-10 text-[#52D1C9]">
          <Link href={`/${pathRoot}/trips/tripInfo/${tripInfo.tripId}`}>
            <strong>More info</strong>
          </Link>
          <i className="fi fi-br-angle-small-down pl-1"></i>
        </div>
      </div>
    </div>
  );
}
