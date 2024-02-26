import { TripStatus, getTripStatusBgColorClassFromStatus, getTripStatusTextFromStatus } from "@/model/TripInfo";
import { memo } from "react";
import { twMerge } from "tailwind-merge";

function CarPhotoWithStatus({ carImageUrl, tripStatus }: { carImageUrl: string; tripStatus: TripStatus }) {
  let statusBgColor = getTripStatusBgColorClassFromStatus(tripStatus);
  const statusClassName = twMerge(
    "absolute right-0 top-2 px-8 py-2 rounded-l-3xl text-rnt-temp-status-text text-end",
    statusBgColor
  );

  return (
    <>
      {/* <div className="relative h-56 w-60 flex-shrink-0">
          <Image
            src={tripInfo.image}
            alt=""
            width={1000}
            height={1000}
            className="h-full w-full object-cover"
          /> */}

      {/* Empty span to generate tailwind css colors for statuses */}
      <span className="bg-yellow-600 bg-lime-500 bg-blue-600 bg-blue-800 bg-purple-600 bg-purple-800 bg-fuchsia-700 bg-red-500" />
      <div
        style={{ backgroundImage: `url(${carImageUrl})` }}
        className="relative w-full 1xl:w-64 min-h-[12rem] md:min-h-[16rem] xl:min-h-[12rem] flex-shrink-0 bg-center bg-cover"
      >
        <div className={statusClassName}>
          <strong className="text-m">{`${getTripStatusTextFromStatus(tripStatus)}`}</strong>
        </div>
      </div>
    </>
  );
}

export default memo(CarPhotoWithStatus);
