import { TripInfo } from "@/model/TripInfo";
import { dateFormatLongMonthDateTime } from "@/utils/datetimeFormatters";
import { memo } from "react";
import { TFunction } from "@/utils/i18n";

function DateDetails({ tripInfo, t }: { tripInfo: TripInfo; t: TFunction }) {
  return (
    <div
      id="trip-info"
      className="flex w-full flex-1 flex-col gap-2 p-4 md:ml-14 md:w-1/4 md:p-2 xl:p-4 2xl:ml-0 fullHD:ml-14"
    >
      <div className="flex flex-col 2xl:mt-6">
        <div>
          <i className="fi fi-rs-calendar pr-1 text-rentality-icons"></i>
          <strong className="text-l">{t("booked.trip_start")}</strong>
        </div>
        <div>{dateFormatLongMonthDateTime(tripInfo.tripStart, tripInfo.timeZoneId)}</div>
      </div>
      <div className="flex flex-col 2xl:mt-4">
        <div>
          <i className="fi fi-rs-calendar pr-1 text-rentality-icons"></i>
          <strong className="text-l">{t("booked.trip_end")}</strong>
        </div>
        <div className="whitespace-nowrap">{dateFormatLongMonthDateTime(tripInfo.tripEnd, tripInfo.timeZoneId)}</div>
      </div>
    </div>
  );
}

export default memo(DateDetails);
