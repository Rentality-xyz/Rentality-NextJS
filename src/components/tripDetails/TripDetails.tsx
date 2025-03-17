import PageTitle from "../pageTitle/pageTitle";
import RntButton from "../common/rntButton";
import useTripInfo from "@/hooks/useTripInfo";
import { useRouter } from "next/router";
import TripCardForDetails from "../tripCard/tripCardForDetails";
import useUserMode from "@/hooks/useUserMode";
import { useTranslation } from "react-i18next";
import RntSuspense from "../common/rntSuspense";
import TripStatusDateTimes from "./TripStatusDateTimes";
import TripReceipt from "./TripReceipt";
import TripAboutCar from "./TripAboutCar";
import TripPhotos from "@/components/carPhotos/tripPhotos";
import useFeatureFlags from "@/hooks/useFeatureFlags";
import { useEffect, useState } from "react";

export default function TripInfo() {
  const { userMode, isHost } = useUserMode();
  const router = useRouter();
  const { tripId: tripIdQuery, back } = router.query;

  const tripId = BigInt((tripIdQuery as string) ?? "0");
  const backPath = back as string;

  const [isLoading, tripInfo] = useTripInfo(tripId);
  const { t } = useTranslation();

  const { hasFeatureFlag } = useFeatureFlags();

  const [hasTripPhotosFeatureFlag, setHasTripPhotosFeatureFlag] = useState<boolean>(false);

  useEffect(() => {
    hasFeatureFlag("FF_TRIP_PHOTOS").then((hasTripPhotosFeatureFlag: boolean) => {
      setHasTripPhotosFeatureFlag(hasTripPhotosFeatureFlag);
    });
  }, []);

  if (tripId == null || tripId === BigInt(0) || tripInfo == null) return null;

  return (
    <>
      <PageTitle title={t("booked.details.title", { tripId: tripId.toString() })} />
      <RntSuspense isLoading={isLoading}>
        <TripCardForDetails key={Number(tripId)} isHost={isHost(userMode)} tripInfo={tripInfo} t={t} />
        <div className="my-6 flex flex-wrap">
          <div className="w-full xl:w-2/3">
            <TripAboutCar tripInfo={tripInfo} />
            <TripStatusDateTimes tripInfo={tripInfo} />
            {hasTripPhotosFeatureFlag && <TripPhotos tripId={tripInfo.tripId} />}
          </div>
          <div className="w-full xl:w-1/3">
            <TripReceipt tripId={tripId} tripInfo={tripInfo} />
          </div>
        </div>
        <div className="mb-8 mt-4 flex flex-row justify-center gap-4">
          <RntButton className="h-16 w-40" onClick={() => router.push(backPath)}>
            {t("common.back")}
          </RntButton>
        </div>
      </RntSuspense>
    </>
  );
}
