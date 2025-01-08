import { ElementRef, memo, useEffect, useRef, useState } from "react";
import { TripInfo } from "@/model/TripInfo";
import CarPhotoWithStatus from "./carPhotoWithStatus";
import СarDetails from "./carDetails";
import CurrentStatusInfo from "./currentStatusInfo";
import DateDetails from "./dateDetails";
import LocationDetails from "./locationDetails";
import TripContacts from "@/components/common/tripContacts";
import TripAdditionalActions from "./tripAdditionalActions";
import { TFunction } from "i18next";
import { usePathname } from "next/navigation";
import Link from "next/link";

function TripCard({
  tripInfo,
  changeStatusCallback,
  disableButton,
  isHost,
  confirmCarDetails,
  t,
}: {
  tripInfo: TripInfo;
  changeStatusCallback: (changeStatus: () => Promise<boolean>) => Promise<boolean>;
  disableButton: boolean;
  isHost: boolean;
  confirmCarDetails?: (tripId: number) => Promise<void>;
  t: TFunction;
}) {
  const [isAdditionalActionHidden, setIsAdditionalActionHidden] = useState(true);
  const allowedActions = document.getElementById("trip-allowed-actions") as HTMLDivElement;
  const allowedActionsRef = useRef<ElementRef<"div">>(allowedActions);
  const pathname = usePathname();
  const pathRoot = isHost ? "host" : "guest";

  useEffect(() => {
    if (window.innerWidth <= 1280 && !isAdditionalActionHidden && allowedActionsRef.current) {
      allowedActionsRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isAdditionalActionHidden]);

  return (
    <div className="rnt-card flex flex-col overflow-hidden rounded-xl bg-rentality-bg">
      <div className="max-2xl:flex-wrap md:flex 2xl:flex-nowrap">
        <CarPhotoWithStatus carImageUrl={tripInfo.image} tripStatus={tripInfo.status} />

        <div id="trip-item-info" className="flex w-full flex-col md:flex-row">
          <СarDetails tripInfo={tripInfo} isHost={isHost} t={t} confirmCarDetails={confirmCarDetails} />
          {
            <CurrentStatusInfo
              tripInfo={tripInfo}
              changeStatusCallback={async (changeStatus) => {
                if (await changeStatusCallback(changeStatus)) {
                  setIsAdditionalActionHidden(true);
                }
              }}
              disableButton={disableButton}
              isAdditionalActionHidden={isAdditionalActionHidden}
              setIsAdditionalActionHidden={setIsAdditionalActionHidden}
              isHost={isHost}
              t={t}
            />
          }
          <DateDetails tripInfo={tripInfo} t={t} />
          <LocationDetails tripInfo={tripInfo} t={t} />
        </div>
        <div className="2xl:w-46 flex flex-col p-4 text-end max-2xl:w-full md:p-2 xl:p-4 2xl:flex-shrink-0">
          <div className="flex max-2xl:justify-between 2xl:flex-col 2xl:gap-2 2xl:pr-8">
            <TripContacts tripInfo={tripInfo} isHost={isHost} t={t} />
            <div className="text-rentality-secondary 2xl:mt-10">
              <Link href={`/${pathRoot}/trips/tripInfo/${tripInfo.tripId}?back=${pathname}`}>
                <strong>{t("booked.more_info")}</strong>
              </Link>
              <i className="fi fi-br-angle-small-down pl-1"></i>
            </div>
          </div>
        </div>
      </div>

      {isAdditionalActionHidden ||
      tripInfo.allowedActions == null ||
      tripInfo.allowedActions.length == 0 ||
      tripInfo.allowedActions[0].params == null ? null : (
        <TripAdditionalActions
          refForScrool={allowedActionsRef}
          tripInfo={tripInfo}
          changeStatusCallback={async (changeStatus) => {
            if (await changeStatusCallback(changeStatus)) {
              setIsAdditionalActionHidden(true);
            }
          }}
          disableButton={disableButton}
          isHost={isHost}
          t={t}
        />
      )}
    </div>
  );
}

export default memo(TripCard);
