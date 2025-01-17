import { memo } from "react";
import { TripInfo } from "@/model/TripInfo";
import CarPhotoWithStatus from "./carPhotoWithStatus";
import СarDetailsForDetails from "./carDetailsForDetails";
import DateDetails from "./dateDetails";
import LocationDetails from "./locationDetails";
import { TFunction } from "i18next";
import TripRules from "./tripRules";

function TripCardForDetails({ tripInfo, isHost, t }: { tripInfo: TripInfo; isHost: boolean; t: TFunction }) {
  return (
    <div className="rnt-card flex flex-col overflow-hidden rounded-xl bg-rentality-bg">
      <div className="md:flex">
        <CarPhotoWithStatus carImageUrl={tripInfo.image} tripStatus={tripInfo.status} />
        <div id="trip-item-info" className="flex w-full grid-cols-[2fr_2fr_1fr] flex-col gap-4 p-4 md:grid">
          <СarDetailsForDetails tripInfo={tripInfo} isHost={isHost} t={t} />
          <div className="flex h-full w-full flex-col gap-4 max-md:mt-4 md:pl-4 fullHD:pl-8">
            <DateDetails tripInfo={tripInfo} t={t} />
            <LocationDetails tripInfo={tripInfo} t={t} />
          </div>
          <TripRules tripInfo={tripInfo} t={t} />
        </div>
      </div>
    </div>
  );
}

export default memo(TripCardForDetails);
