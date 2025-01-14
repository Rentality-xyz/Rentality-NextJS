import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPhotosForTrip, GetPhotosForTripResponseType } from "@/utils/pinata";

const TripPhotos = (
  {
    tripId
  } : {
    tripId: number
  },
) => {

  const { t } = useTranslation();
  const [fileUrls, setFileUrls] = useState<GetPhotosForTripResponseType>({
    checkinByHost: [],
    checkOutByHost: [],
    checkInByGuest: [],
    checkOutByGuest: []
  });

  useEffect(() => {
    getPhotosForTrip(tripId).then((fileUrlList :GetPhotosForTripResponseType) => {
      setFileUrls(fileUrlList as string[]);
    } )
  },[])

  return (
    <div className="rnt-card my-2 flex flex-col overflow-hidden rounded-xl bg-rentality-bg xl:mr-2">
      <div className="flex flex-col p-2">
        <div className="pb-3">
          <strong className="text-2xl text-rentality-secondary">{t("booked.details.trip_photos")}</strong>
        </div>
        <div className="pb-3">
          {t("booked.details.trip_photos_description")}
        </div>
        <hr className="my-4" />
        <div className="flex grow flex-row p-2">
          <table className="m-2">
            <tbody>
            <tr>
              <td>{t("booked.details.trip_photos_checked_in_by_host")}</td>
              <td className="text-end"></td>
            </tr>
            </tbody>
          </table>
        </div>
        <hr className="my-4" />
        <div className="flex grow flex-row p-2">
          <table className="m-2">
            <tbody>
            <tr>
              <td>{t("booked.details.trip_photos_checked_out_by_host")}</td>
              <td className="text-end"></td>
            </tr>
            </tbody>
          </table>
        </div>
        <hr className="my-4" />
        <div className="flex grow flex-row p-2">
          <table className="m-2">
            <tbody>
            <tr>
              <td>{t("booked.details.trip_photos_checked_in_by_guest")}</td>
              <td className="text-end"></td>
            </tr>
            </tbody>
          </table>
        </div>
        <hr className="my-4" />
        <div className="flex grow flex-row p-2">
          <table className="m-2">
            <tbody>
            <tr>
              <td>{t("booked.details.trip_photos_checked_out_by_guest")}</td>
              <td className="text-end"></td>
            </tr>
            </tbody>
          </table>
        </div>
        <hr className="my-4" />
      </div>
    </div>
  )

}

export default TripPhotos;