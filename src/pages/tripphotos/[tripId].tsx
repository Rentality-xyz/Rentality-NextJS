import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { getPhotosForTrip, GetPhotosForTripResponseType } from "@/utils/pinata";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import type { NextPageWithLayout } from "../_app";

const TripPhotos: NextPageWithLayout = () => {
  const IMG_WIDTH: number = 100;
  const IMG_HEIGHT: number = 100;
  const IMG_CLASS_NAME: string = "h-full w-full object-cover p-2 max-w-lg max-h-lg";

  const { t } = useTranslation();

  const [fileUrls, setFileUrls] = useState<GetPhotosForTripResponseType>({
    checkinByHost: [],
    checkOutByHost: [],
    checkInByGuest: [],
    checkOutByGuest: [],
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  const fileUrlsToDisplay: string[] = useMemo(() => {
    const type: string | null = searchParams.get("type");
    switch (type) {
      case "1":
        return fileUrls.checkinByHost;
      case "2":
        return fileUrls.checkOutByHost;
      case "3":
        return fileUrls.checkInByGuest;
      case "4":
        return fileUrls.checkOutByGuest;
      default:
        return [];
    }
  }, [
    fileUrls.checkInByGuest,
    fileUrls.checkOutByGuest,
    fileUrls.checkOutByHost,
    fileUrls.checkinByHost,
    searchParams,
  ]);

  useEffect(() => {
    const { tripId: tripIdQuery, back } = router.query;
    const tripId = Number((tripIdQuery as string) ?? "0");
    if (tripId > 0) {
      getPhotosForTrip(tripId).then((fileUrlList: GetPhotosForTripResponseType) => {
        setFileUrls(fileUrlList);
      });
    }
  }, [searchParams]);

  return searchParams.has("type") ? (
    <div className="flex flex-col">
      {fileUrlsToDisplay.map((fileUrl: string, index: number) => {
        return (
          <Image key={index} className={IMG_CLASS_NAME} width={IMG_WIDTH} height={IMG_HEIGHT} src={fileUrl} alt="" />
        );
      })}
    </div>
  ) : (
    <div className="flex flex-col p-2 lg:flex-row">
      <div className="flex w-1/2 flex-col">
        <div>{t("booked.details.trip_photos_checked_in_by_guest")}</div>
        {fileUrls.checkInByGuest.length == 0
          ? t("common.trip_photos_no_photos")
          : fileUrls.checkInByGuest.map((fileUrl: string, index: number) => {
              return (
                <Image
                  key={index}
                  className={IMG_CLASS_NAME}
                  width={IMG_WIDTH}
                  height={IMG_HEIGHT}
                  src={fileUrl}
                  alt=""
                />
              );
            })}
        <div>{t("booked.details.trip_photos_checked_out_by_guest")}</div>
        {fileUrls.checkOutByGuest.length == 0
          ? t("common.trip_photos_no_photos")
          : fileUrls.checkOutByGuest.map((fileUrl: string, index: number) => {
              return (
                <Image
                  key={index}
                  className={IMG_CLASS_NAME}
                  width={IMG_WIDTH}
                  height={IMG_HEIGHT}
                  src={fileUrl}
                  alt=""
                />
              );
            })}
      </div>
      <div className="flex w-1/2 flex-col">
        <div>{t("booked.details.trip_photos_checked_in_by_host")}</div>
        {fileUrls.checkinByHost.length == 0
          ? t("common.trip_photos_no_photos")
          : fileUrls.checkinByHost.map((fileUrl: string, index: number) => {
              return (
                <Image
                  key={index}
                  className={IMG_CLASS_NAME}
                  width={IMG_WIDTH}
                  height={IMG_HEIGHT}
                  src={fileUrl}
                  alt=""
                />
              );
            })}
        <div>{t("booked.details.trip_photos_checked_out_by_host")}</div>
        {fileUrls.checkOutByHost.length == 0
          ? t("common.trip_photos_no_photos")
          : fileUrls.checkOutByHost.map((fileUrl: string, index: number) => {
              return (
                <Image
                  key={index}
                  className={IMG_CLASS_NAME}
                  width={IMG_WIDTH}
                  height={IMG_HEIGHT}
                  src={fileUrl}
                  alt=""
                />
              );
            })}
      </div>
    </div>
  );
};

TripPhotos.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default TripPhotos;
