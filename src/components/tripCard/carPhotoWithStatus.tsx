import { getTripStatusBgColorClassFromStatus, getTripStatusTextFromStatus } from "@/model/TripInfo";
import { TripStatus } from "@/model/blockchain/schemas";
import { cn } from "@/utils";
import { memo } from "react";

function CarPhotoWithStatus({ carImageUrl, tripStatus }: { carImageUrl: string; tripStatus: TripStatus }) {
  let statusBgColor = getTripStatusBgColorClassFromStatus(tripStatus);
  let completedTripStatusTextFirstWord = "";
  let completedTripStatusTextSecondPart = "";
  let statusClassName = "absolute max-w-[90%] right-0 top-2 py-2 rounded-l-3xl text-rnt-temp-status-text text-end";
  statusClassName = cn(statusClassName, statusBgColor);

  const tripStatusText = getTripStatusTextFromStatus(tripStatus);

  if (tripStatus === TripStatus.CompletedWithoutGuestComfirmation) {
    const [firstWord, ...rest] = tripStatusText.split(" ");
    completedTripStatusTextFirstWord = firstWord;
    completedTripStatusTextSecondPart = rest.join(" ");
    statusClassName = cn(statusClassName, "pl-6 pr-2");
  } else {
    statusClassName = cn(statusClassName, "px-8");
  }

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
      <span className="bg-blue-600 bg-blue-800 bg-fuchsia-700 bg-lime-500 bg-orange-400 bg-purple-600 bg-purple-800 bg-red-500 bg-yellow-600" />
      <div
        style={{ backgroundImage: `url(${carImageUrl})` }}
        className="relative min-h-[12rem] w-full flex-shrink-0 bg-cover bg-center md:min-h-[16rem] xl:min-h-[12rem] xl:w-64"
      >
        {tripStatus == TripStatus.CompletedWithoutGuestComfirmation ? (
          <div className={statusClassName}>
            <strong>{`${completedTripStatusTextFirstWord}`}</strong>
            <p className="text-sm">{`${completedTripStatusTextSecondPart}`}</p>
          </div>
        ) : (
          <div className={statusClassName}>
            <strong>{`${tripStatusText}`}</strong>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(CarPhotoWithStatus);
