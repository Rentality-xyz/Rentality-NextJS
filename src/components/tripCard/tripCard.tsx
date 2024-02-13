import { ElementRef, useEffect, useRef, useState } from "react";
import { TripInfo } from "@/model/TripInfo";
import CarPhotoWithStatus from "./carPhotoWithStatus";
import СarDetails from "./carDetails";
import CurrentStatusInfo from "./currentStatusInfo";
import DateDetails from "./dateDetails";
import LocationDetails from "./locationDetails";
import TripContacts from "./tripContacts";
import TripAdditionalActions from "./tripAdditionalActions";

export default function TripCard({
  tripInfo,
  changeStatusCallback,
  disableButton,
  isHost,
}: {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<void>;
  disableButton: boolean;
  isHost: boolean;
}) {
  const [isAdditionalActionHidden, setIsAdditionalActionHidden] = useState(true);
  const allowedActions = document.getElementById("trip-allowed-actions") as HTMLDivElement;
  const allowedActionsRef = useRef<ElementRef<"div">>(allowedActions);

  useEffect(() => {
    if (window.innerWidth <= 1280 && !isAdditionalActionHidden && allowedActionsRef.current) {
      allowedActionsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isAdditionalActionHidden]);

  return (
    <div className="rnt-card flex flex-col rounded-xl overflow-hidden bg-rentality-bg">
      <div className="sm_inverted:flex max-2xl:flex-wrap 2xl:flex-nowrap">
        <CarPhotoWithStatus carImageUrl={tripInfo.image} tripStatus={tripInfo.status} />

        <div id="trip-item-info" className="w-full flex flex-col sm_inverted:flex-row">
          <СarDetails tripInfo={tripInfo} isHost={isHost} />
          <CurrentStatusInfo
            tripInfo={tripInfo}
            changeStatusCallback={changeStatusCallback}
            disableButton={disableButton}
            isAdditionalActionHidden={isAdditionalActionHidden}
            setIsAdditionalActionHidden={setIsAdditionalActionHidden}
            isHost={isHost}
          />
          <DateDetails tripInfo={tripInfo} />
          <LocationDetails tripInfo={tripInfo} />
        </div>
        <TripContacts tripInfo={tripInfo} isHost={isHost} />
      </div>

      {isAdditionalActionHidden ||
      tripInfo.allowedActions == null ||
      tripInfo.allowedActions.length == 0 ||
      tripInfo.allowedActions[0].params == null ? null : (
        <TripAdditionalActions
          refForScrool={allowedActionsRef}
          tripInfo={tripInfo}
          changeStatusCallback={changeStatusCallback}
          disableButton={disableButton}
          isHost={isHost}
        />
      )}
    </div>
  );
}
