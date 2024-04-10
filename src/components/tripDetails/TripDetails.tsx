import useTripDetails from "@/hooks/useTripInfo";
import PageTitle from "../pageTitle/pageTitle";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";
import { useRouter } from "next/router";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";
import { dateFormatLongMonthDateTime, dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import TripCard from "@/components/tripCard/tripCard";
import { TFunction } from "@/pages/i18n";

export default function TripDetails({ tripId, t }: { tripId: bigint; t: TFunction }) {
  const [isLoading, tripDetails] = useTripDetails(tripId);
  const router = useRouter();
  const t_details: TFunction = (name, options) => {
    return t("booked.details." + name, options);
  };

  if (tripId == null || tripId === BigInt(0)) return null;

  return (
    <>
      <PageTitle title={t_details("title", { tripId: tripId.toString() })} />
      {isLoading ? (
        <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
          {t("common.info.loading")}
        </div>
      ) : (
        <>
           <TripCard
            key={tripId}
            tripInfo={tripDetails}
            disableButton={true}
            isHost={false}
          />         
        
          <div className="my-4 flex flex-col md:grid grid-cols-2 gap-4 pr-4">
            <div className="flex flex-row gap-4">
              <RntInput id="tripId" label={t_details("tripId")} value={tripDetails.tripId.toString()} readOnly={true} />
              <RntInput id="carId" label={t_details("carId")} value={tripDetails.carId.toString()} readOnly={true} />
            </div>
            <RntInput id="status" label={t_details("status")} value={tripDetails.status} readOnly={true} />
            <RntInput id="host" label={t_details("host_addr")} value={tripDetails.hostAddress} readOnly={true} />
            <RntInput id="guest" label={t_details("guest_addr")} value={tripDetails.guestAddress} readOnly={true} />
            <RntInput
              id="startDateTime"
              label={t_details("start_time")}
              value={dateFormatShortMonthDateTime(tripDetails.startDateTime, tripDetails.timeZoneId)}
              readOnly={true}
            />
            <RntInput
              id="endDateTime"
              label={t_details("end_time")}
              value={dateFormatShortMonthDateTime(tripDetails.endDateTime, tripDetails.timeZoneId)}
              readOnly={true}
            />
            <RntInput
              id="startLocation"
              label={t_details("start_location")}
              value={tripDetails.startLocation}
              readOnly={true}
            />
            <RntInput
              id="endLocation"
              label={t_details("end_location")}
              value={tripDetails.endLocation}
              readOnly={true}
            />
            <RntInput
              id="milesIncluded"
              label={t_details("miles_included")}
              value={getMilesIncludedPerDayText(tripDetails.milesIncludedPerDay)}
              readOnly={true}
            />
            <RntInput
              id="fuelPricePerGalInUsdCents"
              label={t_details("fuel_price")}
              value={tripDetails.fuelPricePerGal.toString()}
              readOnly={true}
            />
            <RntInput
              id="approvedDateTime"
              label={t_details("approved_at")}
              value={
                tripDetails.approvedDateTime
                  ? dateFormatShortMonthDateTime(tripDetails.approvedDateTime, tripDetails.timeZoneId)
                  : "-"
              }
              readOnly={true}
            />
            <RntInput
              id="checkedInByHostDateTime"
              label={t_details("check_in_at")}
              value={
                tripDetails.checkedInByHostDateTime
                  ? dateFormatShortMonthDateTime(tripDetails.checkedInByHostDateTime, tripDetails.timeZoneId)
                  : "-"
              }
              readOnly={true}
            />
            <RntInput
              id="startFuelLevel"
              label={t_details("start_fuel_level")}
              value={tripDetails.startFuelLevelInPercents?.toString() ?? "-"}
              readOnly={true}
            />
            <RntInput
              id="startOdometr"
              label={t_details("start_odometer")}
              value={tripDetails.startOdometr?.toString() ?? "-"}
              readOnly={true}
            />
            <RntInput
              id="checkedInByGuestDateTime"
              label={t_details("check_in_guest_at")}
              value={
                tripDetails.checkedInByGuestDateTime
                  ? dateFormatShortMonthDateTime(tripDetails.checkedInByGuestDateTime, tripDetails.timeZoneId)
                  : "-"
              }
              readOnly={true}
            />
            <RntInput
              id="checkedOutByGuestDateTime"
              label={t_details("check_out_guest_at")}
              value={
                tripDetails.checkedOutByGuestDateTime
                  ? dateFormatShortMonthDateTime(tripDetails.checkedOutByGuestDateTime, tripDetails.timeZoneId)
                  : "-"
              }
              readOnly={true}
            />
            <RntInput
              id="endFuelLevel"
              label={t_details("end_fuel_level")}
              value={tripDetails.endFuelLevelInPercents?.toString() ?? "-"}
              readOnly={true}
            />
            <RntInput
              id="endOdometr"
              label={t_details("end_odometer")}
              value={tripDetails.endOdometr?.toString() ?? "-"}
              readOnly={true}
            />
            <RntInput
              id="checkedOutByHostDateTime"
              label={t_details("check_out_host_at")}
              value={
                tripDetails.checkedOutByHostDateTime
                  ? dateFormatShortMonthDateTime(tripDetails.checkedOutByHostDateTime, tripDetails.timeZoneId)
                  : "-"
              }
              readOnly={true}
            />
            <RntInput
              id="paymentFrom"
              label={t_details("payments", { value: "from" })}
              value={tripDetails.paymentFrom}
              readOnly={true}
            />
            <RntInput
              id="paymentTo"
              label={t_details("payments", { value: "to" })}
              value={tripDetails.paymentTo}
              readOnly={true}
            />
            <RntInput
              id="pricePerDayInUsdCents"
              label={t_details("day_price")}
              value={tripDetails.pricePerDayInUsdCents.toString()}
              readOnly={true}
            />
            <RntInput
              id="totalDayPriceInUsdCents"
              label={t_details("total_price")}
              value={tripDetails.totalDayPriceInUsd.toString()}
              readOnly={true}
            />
            <RntInput
              id="taxPriceInUsdCents"
              label={t_details("taxes")}
              value={tripDetails.taxPriceInUsd.toString()}
              readOnly={true}
            />
            <RntInput
              id="depositInUsdCents"
              label={t_details("deposit")}
              value={tripDetails.depositInUsd.toString()}
              readOnly={true}
            />
            <RntInput
              id="ethToCurrencyRate"
              label={t_details("eth_rate")}
              value={tripDetails.currencyRate.toString()}
              readOnly={true}
            />
            <RntInput
              id="resolveAmountInUsdCents"
              label={t_details("resolve")}
              value={tripDetails.resolveAmountInUsd?.toString() ?? "-"}
              readOnly={true}
            />
          </div>
          <div className="flex flex-row gap-4 mb-8 mt-4 items-center">
            <RntButton className="w-40 h-16" onClick={() => router.back()}>
              {t("common.back")}
            </RntButton>
          </div>
        </>
      )}
    </>
  );
}
