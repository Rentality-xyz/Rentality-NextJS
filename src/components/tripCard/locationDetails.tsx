import { TripInfo } from "@/model/TripInfo";
import { memo } from "react";
import { TFunction } from "@/utils/i18n";

function LocationDetails({ tripInfo, t }: { tripInfo: TripInfo; t: TFunction }) {
  return (
    <div id="trip-location-info" className="flexs flex-col">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div>
            <i className="fi fi-rs-marker pr-1 text-rentality-icons"></i>
            <strong className="whitespace-nowrap text-lg">{t("booked.pick_up_location")}</strong>
          </div>
          <p>{tripInfo.locationStart}&nbsp;</p>
          {/* <div>Miami, CA, USA</div> */}
        </div>
        <div className="flex flex-col">
          <div>
            <i className="fi fi-rs-marker pr-1 text-rentality-icons"></i>
            <strong className="whitespace-nowrap text-lg">{t("booked.return_location")}</strong>
          </div>
          <p>{tripInfo.locationEnd}&nbsp;</p>
          {/* <div>Miami, CA, USA</div> */}
        </div>
      </div>
    </div>
  );
}

export default memo(LocationDetails);
