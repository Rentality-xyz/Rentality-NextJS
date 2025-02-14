import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPhotosForTrip, GetPhotosForTripResponseType } from "@/utils/pinata";

const TripPhotos = ({ tripId }: { tripId: number }) => {
  const { t } = useTranslation();
  const [fileUrls, setFileUrls] = useState<GetPhotosForTripResponseType>({
    checkinByHost: [],
    checkOutByHost: [],
    checkInByGuest: [],
    checkOutByGuest: [],
  });

  useEffect(() => {
    getPhotosForTrip(tripId).then((fileUrlList: GetPhotosForTripResponseType) => {
      setFileUrls(fileUrlList);
    });
  }, [tripId]);

  const totalPhotos: number = useMemo(() => {
    return (
      fileUrls.checkinByHost.length +
      fileUrls.checkOutByGuest.length +
      fileUrls.checkInByGuest.length +
      fileUrls.checkOutByGuest.length
    );
  }, [fileUrls.checkInByGuest.length, fileUrls.checkOutByGuest.length, fileUrls.checkinByHost.length]);

  return (
    <div className="rnt-card my-2 flex flex-col overflow-hidden rounded-xl bg-rentality-bg xl:mr-2">
      <div className="flex flex-col p-2">
        <div className="pb-3">
          <strong className="text-2xl text-rentality-secondary">{t("booked.details.trip_photos")}</strong>
        </div>
        <div className="pb-3">{t("booked.details.trip_photos_description")}</div>
        <hr className="my-4 w-1/2" />
        <div className="flex w-1/2 grow flex-row p-2">
          <table className="m-2 w-full">
            <tbody>
              <tr>
                <td>{t("booked.details.trip_photos_checked_in_by_host")}</td>
                <td className="text-end text-rentality-secondary">
                  {fileUrls.checkinByHost.length == 0 ? (
                    <span className="text-gray-400">{t("common.trip_photos_no_photos")}</span>
                  ) : (
                    <a target="_blank" href={"/tripphotos/" + tripId + "?type=1"}>
                      {fileUrls.checkinByHost.length}&nbsp;{t("common.trip_photos_photos")}
                    </a>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr className="my-4 w-1/2" />
        <div className="flex w-1/2 grow flex-row p-2">
          <table className="m-2 w-full">
            <tbody>
              <tr>
                <td>{t("booked.details.trip_photos_checked_out_by_host")}</td>
                <td className="text-end text-rentality-secondary">
                  {fileUrls.checkOutByHost.length == 0 ? (
                    <span className="text-gray-400">{t("common.trip_photos_no_photos")}</span>
                  ) : (
                    <a target="_blank" href={"/tripphotos/" + tripId + "?type=2"}>
                      {fileUrls.checkOutByHost.length}&nbsp;{t("common.trip_photos_photos")}
                    </a>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr className="my-4 w-1/2" />
        <div className="flex w-1/2 grow flex-row p-2">
          <table className="m-2 w-full">
            <tbody>
              <tr>
                <td>{t("booked.details.trip_photos_checked_in_by_guest")}</td>
                <td className="text-end text-rentality-secondary">
                  {fileUrls.checkInByGuest.length == 0 ? (
                    <span className="text-gray-400">{t("common.trip_photos_no_photos")}</span>
                  ) : (
                    <a target="_blank" href={"/tripphotos/" + tripId + "?type=3"}>
                      {fileUrls.checkInByGuest.length}&nbsp;{t("common.trip_photos_photos")}
                    </a>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr className="my-4 w-1/2" />
        <div className="flex w-1/2 grow flex-row p-2">
          <table className="m-2 w-full">
            <tbody>
              <tr>
                <td>{t("booked.details.trip_photos_checked_out_by_guest")}</td>
                <td className="text-end text-rentality-secondary">
                  {fileUrls.checkOutByGuest.length == 0 ? (
                    <span className="text-gray-400">{t("common.trip_photos_no_photos")}</span>
                  ) : (
                    <a target="_blank" href={"/tripphotos/" + tripId + "?type=4"}>
                      {fileUrls.checkOutByGuest.length}&nbsp;{t("common.trip_photos_photos")}
                    </a>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr className="my-4 w-1/2" />
        <div className="flex w-1/2 grow flex-row p-2">
          <table className="m-2 w-full">
            <tbody>
              <tr>
                <td></td>
                <td className="text-end text-rentality-secondary">
                  {totalPhotos == 0 ? (
                    <span className="text-gray-400">{t("common.trip_photos_no_photos")}</span>
                  ) : (
                    <a target="_blank" href={"/tripphotos/" + tripId}>
                      {t("common.trip_photos_see_all") + " " + totalPhotos + " " + t("common.trip_photos_photos")}
                    </a>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TripPhotos;
