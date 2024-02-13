import { TripInfo } from "@/model/TripInfo";
import { dateFormat } from "@/utils/datetimeFormatters";

export default function DateDetails({ tripInfo }: { tripInfo: TripInfo }) {
  return (
    <div id="trip-info" className="w-full sm_inverted:w-1/4 flex flex-1 flex-col gap-2 p-4 md:p-2 xl:p-4 2xl:ml-14">
      <div className="flex flex-col 2xl:mt-6">
        <div>
          <i className="fi fi-rs-calendar pr-1  text-rentality-icons"></i>
          <strong className="text-l">Trip start</strong>
        </div>
        <div className="whitespace-nowrap">{dateFormat(tripInfo.tripStart)}</div>
      </div>
      <div className="flex flex-col 2xl:mt-4">
        <div>
          <i className="fi fi-rs-calendar pr-1  text-rentality-icons"></i>
          <strong className="text-l">Trip end</strong>
        </div>
        <div className="whitespace-nowrap">{dateFormat(tripInfo.tripEnd)}</div>
      </div>
    </div>
  );
}
