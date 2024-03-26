import { BaseCarInfo } from "@/model/BaseCarInfo";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";

export default function PublicListingItem({ carInfo }: { carInfo: BaseCarInfo }) {
  return (
    <div className="bg-rentality-bg rnt-card flex flex-col sm_inverted:flex-row rounded-xl overflow-hidden">
      <div
        style={{ backgroundImage: `url(${carInfo.image})` }}
        className="relative w-full sm_inverted:w-64 min-h-[12rem] flex-shrink-0 bg-center bg-cover"
      ></div>
      <div className="w-full flex flex-col justify-between p-4">
        <div className="flex flex-row justify-between items-baseline">
          <div>
            <strong className="text-xl">{`${carInfo.brand} ${carInfo.model} ${carInfo.year}`}</strong>
          </div>
          <div>{carInfo.licensePlate}</div>
        </div>
        <div className="flex flex-row justify-between items-end">
          <div className="flex flex-col">
            <strong className="text-xl">{`$${carInfo.pricePerDay}/day`}</strong>
            <div className="text-sm">{`${getMilesIncludedPerDayText(carInfo.milesIncludedPerDay)} miles per day`}</div>
            <div className="text-sm">{`$${carInfo.securityDeposit} Security deposit`}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
