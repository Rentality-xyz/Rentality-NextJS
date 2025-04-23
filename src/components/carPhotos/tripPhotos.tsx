import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ImageCarouselDialog from "../createTrip/ImageCarouselDialog";
import { GetPhotosForTripResponseType, getTripCarPhotos } from "@/features/filestore/pinata/utils";
import SendPhotosToAi from "@/features/aiDamageAnalyze/components/SendPhotosToAi";

const defaultCarouselState = {
  isOpen: false,
  images: [],
  title: "",
};

const TripPhotos = ({ tripId }: { tripId: number }) => {
  const { t } = useTranslation();
  const [fileUrls, setFileUrls] = useState<GetPhotosForTripResponseType>({
    checkInByHost: [],
    checkOutByHost: [],
    checkInByGuest: [],
    checkOutByGuest: [],
  });

  const [carouselState, setCarouselState] = useState<{ isOpen: boolean; images: string[]; title: string }>(
    defaultCarouselState
  );

  function handleShowPhotos(title: string, urls: string[]) {
    if (urls.length === 0) return;

    setCarouselState({
      isOpen: true,
      images: urls,
      title: title,
    });
  }

  function handleCloseCarousel() {
    setCarouselState(defaultCarouselState);
  }

  useEffect(() => {
    getTripCarPhotos(tripId).then((fileUrlList: GetPhotosForTripResponseType) => {
      setFileUrls(fileUrlList);
    });
  }, [tripId]);

  const totalPhotos: number = useMemo(() => {
    return (
      fileUrls.checkInByHost.length +
      fileUrls.checkInByGuest.length +
      fileUrls.checkOutByGuest.length +
      fileUrls.checkOutByHost.length
    );
  }, [
    fileUrls.checkInByHost.length,
    fileUrls.checkInByGuest.length,
    fileUrls.checkOutByGuest.length,
    fileUrls.checkOutByHost.length,
  ]);

  return (
    <>
      <div className="rnt-card my-2 flex flex-col overflow-hidden rounded-xl bg-rentality-bg xl:mr-2">
        <div className="flex flex-col p-2">
          <div className="pb-3">
            <strong className="text-2xl text-rentality-secondary">{t("booked.details.trip_photos")}</strong>
          </div>
          <div className="pb-3">{t("booked.details.trip_photos_description")}</div>
          <div className="flex w-full flex-row gap-4">
            <div className="flex w-1/2 flex-col">
              <hr className="my-4 w-full" />
              <div className="flex w-full grow flex-row p-2">
                <table className="m-2 w-full">
                  <tbody>
                    <tr>
                      <td>{t("booked.details.trip_photos_checked_in_by_host")}</td>
                      <td className="text-end text-rentality-secondary">
                        {fileUrls.checkInByHost.length == 0 ? (
                          <span className="text-gray-400">{t("common.trip_photos_no_photos")}</span>
                        ) : (
                          <span
                            className="cursor-pointer"
                            onClick={() =>
                              handleShowPhotos(
                                t("booked.details.trip_photos_checked_in_by_host"),
                                fileUrls.checkInByHost
                              )
                            }
                          >
                            {fileUrls.checkInByHost.length}&nbsp;{t("common.trip_photos_photos")}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <hr className="my-4 w-full" />
              <div className="flex w-full grow flex-row p-2">
                <table className="m-2 w-full">
                  <tbody>
                    <tr>
                      <td>{t("booked.details.trip_photos_checked_in_by_guest")}</td>
                      <td className="text-end text-rentality-secondary">
                        {fileUrls.checkInByGuest.length == 0 ? (
                          <span className="text-gray-400">{t("common.trip_photos_no_photos")}</span>
                        ) : (
                          <span
                            className="cursor-pointer"
                            onClick={() =>
                              handleShowPhotos(
                                t("booked.details.trip_photos_checked_in_by_guest"),
                                fileUrls.checkInByGuest
                              )
                            }
                          >
                            {fileUrls.checkInByGuest.length}&nbsp;{t("common.trip_photos_photos")}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <hr className="my-4 w-full" />
              <div className="flex w-full grow flex-row p-2">
                <table className="m-2 w-full">
                  <tbody>
                    <tr>
                      <td>{t("booked.details.trip_photos_checked_out_by_guest")}</td>
                      <td className="text-end text-rentality-secondary">
                        {fileUrls.checkOutByGuest.length == 0 ? (
                          <span className="text-gray-400">{t("common.trip_photos_no_photos")}</span>
                        ) : (
                          <span
                            className="cursor-pointer"
                            onClick={() =>
                              handleShowPhotos(
                                t("booked.details.trip_photos_checked_out_by_guest"),
                                fileUrls.checkOutByGuest
                              )
                            }
                          >
                            {fileUrls.checkOutByGuest.length}&nbsp;{t("common.trip_photos_photos")}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <hr className="my-4 w-full" />
              <div className="flex w-full grow flex-row p-2">
                <table className="m-2 w-full">
                  <tbody>
                    <tr>
                      <td>{t("booked.details.trip_photos_checked_out_by_host")}</td>
                      <td className="text-end text-rentality-secondary">
                        {fileUrls.checkOutByHost.length == 0 ? (
                          <span className="text-gray-400">{t("common.trip_photos_no_photos")}</span>
                        ) : (
                          <span
                            className="cursor-pointer"
                            onClick={() =>
                              handleShowPhotos(
                                t("booked.details.trip_photos_checked_out_by_host"),
                                fileUrls.checkOutByHost
                              )
                            }
                          >
                            {fileUrls.checkOutByHost.length}&nbsp;{t("common.trip_photos_photos")}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <hr className="my-4 w-full" />
              <div className="flex w-full grow flex-row p-2">
                <table className="m-2 w-full">
                  <tbody>
                    <tr>
                      <td></td>
                      <td className="text-end text-rentality-secondary">
                        {totalPhotos == 0 ? (
                          <span className="text-gray-400">{t("common.trip_photos_no_photos")}</span>
                        ) : (
                          <span
                            className="cursor-pointer"
                            onClick={() =>
                              handleShowPhotos(t("booked.details.trip_photos_all"), [
                                ...fileUrls.checkInByHost,
                                ...fileUrls.checkInByGuest,
                                ...fileUrls.checkOutByGuest,
                                ...fileUrls.checkOutByHost,
                              ])
                            }
                          >
                            {t("common.trip_photos_see_all") + " " + totalPhotos + " " + t("common.trip_photos_photos")}
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex w-1/2 flex-col">
              <SendPhotosToAi tripId={tripId} />
            </div>
          </div>
        </div>
      </div>

      <ImageCarouselDialog
        images={carouselState.images}
        isOpen={carouselState.isOpen}
        title={carouselState.title}
        onClose={handleCloseCarousel}
      />
    </>
  );
};

export default TripPhotos;
