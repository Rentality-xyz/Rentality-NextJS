import { TripInfo } from "@/model/TripInfo";
import { dateFormatLongMonthDateTime } from "@/utils/datetimeFormatters";
import { memo } from "react";
import { TFunction } from "@/utils/i18n";

function DateDetails({ tripInfo, t }: { tripInfo: TripInfo; t: TFunction }) {
  return (
    <div id="trip-info" className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div>
          <i className="fi fi-rs-calendar pr-1 text-rentality-icons"></i>
          <strong className="text-l">{t("booked.trip_start")}</strong>
        </div>
        <div>{dateFormatLongMonthDateTime(tripInfo.tripStart, tripInfo.timeZoneId)}</div>
      </div>
      <div className="flex flex-col">
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
