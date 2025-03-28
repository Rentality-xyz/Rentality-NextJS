import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { TripStatus } from "@/model/blockchain/schemas";
import { cn } from "@/utils";
import { memo } from "react";
import { getTripStatusBgColorFromStatus } from "@/utils/tailwind";

function CarPhotoWithStatus({
  minHeight = "212px",
  carImageUrl,
  tripStatus,
}: {
  minHeight?: string;
  carImageUrl: string;
  tripStatus: TripStatus;
}) {
  let statusBgColor = getTripStatusBgColorFromStatus(tripStatus);
  let completedTripStatusTextFirstWord = "";
  let completedTripStatusTextSecondPart = "";
  let statusClassName = "absolute right-0 top-2 py-2 rounded-l-3xl text-rnt-temp-status-text text-end";
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
    <div
      style={{ backgroundImage: `url(${carImageUrl})`, minHeight: `${minHeight}` }}
      className="relative w-full bg-cover bg-center"
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
  );
}

export default memo(CarPhotoWithStatus);
