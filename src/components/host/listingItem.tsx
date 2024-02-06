import { BaseCarInfo, getListingStatusTextFromStatus } from "@/model/BaseCarInfo";
import RntButton from "../common/rntButton";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function ListingItem({ carInfo }: { carInfo: BaseCarInfo }) {
  let statusBgColor = carInfo.currentlyListed ? "bg-lime-500" : "bg-red-500";
  const statusClassName = twMerge(
    "absolute right-0 top-2 px-8 py-2 rounded-l-3xl text-rnt-temp-status-text text-end",
    statusBgColor
  );

  return (
    <div className="bg-rentality-bg rnt-card flex flex-col sm_inverted:flex-row rounded-xl overflow-hidden">
      {/* <div className="w-60 h-56 flex-shrink-0">
        <Image
          src={carInfo.image}
          alt=""
          width={1000}
          height={1000}
          className="h-full w-full object-cover"
        />
      </div> */}
      <div
        style={{ backgroundImage: `url(${carInfo.image})` }}
        className="relative w-full sm_inverted:w-64 min-h-[12rem] flex-shrink-0 bg-center bg-cover"
      >
        <div className={statusClassName}>
          <strong className="text-m">{`${getListingStatusTextFromStatus(carInfo.currentlyListed)}`}</strong>
        </div>
      </div>
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
            <div className="text-sm">{`${carInfo.milesIncludedPerDay} miles per day`}</div>
            <div className="text-sm">{`$${carInfo.securityDeposit} Security deposit`}</div>
          </div>
          <Link href={`/host/vehicles/edit/${carInfo.carId}`}>
            <RntButton className="w-28 h-12">Edit</RntButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
