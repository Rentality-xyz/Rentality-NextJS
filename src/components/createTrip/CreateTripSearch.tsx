import { SearchCarRequest } from "@/model/SearchCarRequest";
import { DeliveryDetails } from "@/model/SearchCarsResult";
import { dateFormatLongMonthDateTime } from "@/utils/datetimeFormatters";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { useTranslation } from "react-i18next";

export function CreateTripSearch({
  searchRequest,
  hostHomeLocation,
  deliveryDetails,
}: {
  searchRequest: SearchCarRequest;
  hostHomeLocation: string;
  deliveryDetails: DeliveryDetails;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col items-center">
        <p className="text-rentality-secondary">{t("create_trip.trip_start")}</p>
        <p>{dateFormatLongMonthDateTime(searchRequest.dateFrom)}</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-rentality-secondary">{t("create_trip.trip_end")}</p>
        <p>{dateFormatLongMonthDateTime(searchRequest.dateTo)}</p>
      </div>
      <hr className="col-span-2" />
      <div className="flex flex-col items-center">
        <p className="text-rentality-secondary">{t("create_trip.pickup_location")}</p>
        <p>
          {searchRequest.deliveryInfo.pickupLocation.isHostHomeLocation
            ? hostHomeLocation
            : searchRequest.deliveryInfo.pickupLocation.locationInfo.address}
        </p>
        {searchRequest.deliveryInfo.pickupLocation.isHostHomeLocation && (
          <p className="text-xs text-gray-500">{t("create_trip.full_address_after_booking")}</p>
        )}
      </div>
      <div className="flex flex-col items-center">
        <p className="text-rentality-secondary">{t("create_trip.return_location")}</p>
        <p>
          {searchRequest.deliveryInfo.returnLocation.isHostHomeLocation
            ? hostHomeLocation
            : searchRequest.deliveryInfo.returnLocation.locationInfo.address}
        </p>
        {searchRequest.deliveryInfo.returnLocation.isHostHomeLocation && (
          <p className="text-xs text-gray-500">{t("create_trip.full_address_after_booking")}</p>
        )}
      </div>
      <hr className="col-span-2" />
      <div className="col-span-2 mx-auto text-rentality-secondary">{t("create_trip.delivery")}</div>
      <div className="flex flex-col items-center">
        {searchRequest.deliveryInfo.pickupLocation.isHostHomeLocation ? (
          <>
            <p className="text-rentality-secondary">{t("create_trip.host_home_location")}</p>
            <p>{t("create_trip.delivery_free")}</p>
          </>
        ) : (
          <>
            <p className="text-rentality-secondary">{t("create_trip.deliver_to_guest")}</p>
            <p>
              {t("create_trip.n_miles_to_location", {
                distanceInMiles: deliveryDetails.pickUp.distanceInMiles,
                priceInUsd: displayMoneyWith2Digits(deliveryDetails.pickUp.priceInUsd),
              })}
            </p>
          </>
        )}
      </div>
      <div className="flex flex-col items-center">
        {searchRequest.deliveryInfo.returnLocation.isHostHomeLocation ? (
          <>
            <p className="text-rentality-secondary">{t("create_trip.host_home_location")}</p>
            <p>{t("create_trip.delivery_free")}</p>
          </>
        ) : (
          <>
            <p className="text-rentality-secondary">{t("create_trip.deliver_to_guest")}</p>
            <p>
              {t("create_trip.n_miles_to_location", {
                distanceInMiles: deliveryDetails.dropOff.distanceInMiles,
                priceInUsd: displayMoneyWith2Digits(deliveryDetails.dropOff.priceInUsd),
              })}
            </p>
          </>
        )}
      </div>
      <hr className="col-span-2" />
    </div>
  );
}
