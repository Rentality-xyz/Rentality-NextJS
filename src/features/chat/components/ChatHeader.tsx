import { ChatInfo } from "@/model/ChatInfo";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { cn } from "@/utils";
import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import { TFunction } from "@/utils/i18n";
import { getTripStatusBgColorFromStatus } from "@/utils/tailwind";

export default function ChatHeader({ selectedChat, t }: { selectedChat: ChatInfo; t: TFunction }) {
  let statusBgColor = getTripStatusBgColorFromStatus(selectedChat?.tripStatus);
  const statusClassName = cn(
    "absolute right-0 top-2 px-1 sm:px-4 py-1 rounded-l-3xl bg-purple-600 text-rnt-temp-status-text text-end text-sm",
    statusBgColor
  );

  return (
    <section className="rnt-card mt-4 flex overflow-hidden rounded-xl">
      <div
        style={{
          backgroundImage: `url(${selectedChat.carPhotoUrl})`,
        }}
        className="relative min-h-[6rem] w-7/12 flex-shrink-0 bg-cover bg-center sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/4"
      >
        <div className={statusClassName}>
          <strong className="text-sm">{getTripStatusTextFromStatus(selectedChat.tripStatus)}</strong>
        </div>
      </div>
      <div className="flex w-3/4 flex-col justify-center gap-2 p-2 pl-8">
        <div className="text-sm max-sm:text-base">{t("reservation", { trip: selectedChat.tripId })}</div>
        <div className="text-sm max-sm:text-base">
          {selectedChat.startDateTime.getTime()
            ? `${dateFormatShortMonthDateTime(
                selectedChat.startDateTime,
                selectedChat.timeZoneId
              )} - ${dateFormatShortMonthDateTime(selectedChat.endDateTime, selectedChat.timeZoneId)}`
            : null}
        </div>
        <div className="text-xl max-sm:text-base">{selectedChat.carTitle}</div>
        <div className="text-sm">{selectedChat.carLicenceNumber}</div>
      </div>
    </section>
  );
}
