import { TripInfo } from "@/model/TripInfo";
import { memo } from "react";

function LocationDetails({ tripInfo }: { tripInfo: TripInfo }) {
  return (
    <div id="trip-location-info" className="w-full sm_inverted:w-1/4 flex flex-col flex-1 p-4 md:p-2 xl:p-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col 2xl:mt-6">
          <div>
            <i className="fi fi-rs-marker pr-1  text-rentality-icons"></i>
            <strong className="text-l whitespace-nowrap">Pickup location</strong>
          </div>
          <p>{tripInfo.locationStart}&nbsp;</p>
          {/* <div>Miami, CA, USA</div> */}
        </div>
        <div className="flex flex-col 2xl:mt-4">
          <div>
            <i className="fi fi-rs-marker pr-1 text-rentality-icons"></i>
            <strong className="text-l whitespace-nowrap">Return location</strong>
          </div>
          <p>{tripInfo.locationEnd}&nbsp;</p>
          {/* <div>Miami, CA, USA</div> */}
        </div>
      </div>
    </div>
  );
}

export default memo(LocationDetails);
