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
      <div className="flex flex-col md:flex-row">
        <CarPhotoWithStatus carImageUrl={tripInfo.image} tripStatus={tripInfo.status} />
        <div id="trip-item-info" className="flex w-full grid-cols-[1fr_2fr_2fr_1fr] flex-col gap-4 p-4 md:grid">
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
          <div className="flex h-full w-full flex-col justify-between gap-4 max-md:mt-2 md:pl-4 fullHD:pl-8">
            <DateDetails tripInfo={tripInfo} t={t} />
            <LocationDetails tripInfo={tripInfo} t={t} />
          </div>
          <div className="flex w-full gap-4 max-md:mt-2 max-md:justify-between md:flex-col">
            <TripContacts tripInfo={tripInfo} isHost={isHost} t={t} />
            <div className="text-rentality-secondary">
              <Link href={`/${pathRoot}/trips/tripInfo/${tripInfo.tripId}?back=${pathname}`}>
                <strong>{t("booked.more_info")}</strong>
              </Link>
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
