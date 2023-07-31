import useTripDetails from "@/hooks/useTripInfo";
import PageTitle from "../pageTitle/pageTitle";
import RntInput from "../common/rntInput";
import RntButton from "../common/rntButton";
import { useRouter } from "next/router";

type Props = {
  tripId: bigint;
};

export default function TripDetails({ tripId }: Props) {
  const [dataFetched, tripDetails] = useTripDetails(tripId);
  const router = useRouter();

  if (tripId == null || tripId === BigInt(0)) return null;

  return (
    <>
      <div className="flex flex-col px-8 pt-4">
        <PageTitle title={`Trip #${tripId.toString()} details`} />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <>
            <div className="my-4 grid grid-cols-2 gap-4 pr-4">
              <div className="flex flex-row gap-4">
                <RntInput
                  id="tripId"
                  label="Trip id:"
                  value={tripDetails.tripId.toString()}
                  readOnly={true}
                />
                <RntInput
                  id="carId"
                  label="Car id:"
                  value={tripDetails.carId.toString()}
                  readOnly={true}
                />
              </div>
              <RntInput
                id="status"
                label="Status:"
                value={tripDetails.status}
                readOnly={true}
              />
              <RntInput
                id="host"
                label="Host address:"
                value={tripDetails.host}
                readOnly={true}
              />
              <RntInput
                id="guest"
                label="Guest address:"
                value={tripDetails.guest}
                readOnly={true}
              />
              <RntInput
                id="startDateTime"
                label="Start date and time:"
                value={tripDetails.startDateTime.toUTCString()}
                readOnly={true}
              />
              <RntInput
                id="endDateTime"
                label="End date and time:"
                value={tripDetails.endDateTime.toUTCString()}
                readOnly={true}
              />
              <RntInput
                id="startLocation"
                label="Start Location:"
                value={tripDetails.startLocation}
                readOnly={true}
              />
              <RntInput
                id="endLocation"
                label="End Location:"
                value={tripDetails.endLocation}
                readOnly={true}
              />
              <RntInput
                id="milesIncluded"
                label="Miles included:"
                value={tripDetails.milesIncludedPerDay.toString()}
                readOnly={true}
              />
              <RntInput
                id="fuelPricePerGalInUsdCents"
                label="Fuel price per gal in USD:"
                value={tripDetails.fuelPricePerGalInUsd.toString()}
                readOnly={true}
              />
              <RntInput
                id="approvedDateTime"
                label="Approved date and time:"
                value={tripDetails.approvedDateTime?.toUTCString() ?? "-"}
                readOnly={true}
              />
              <RntInput
                id="checkedInByHostDateTime"
                label="Checked-in by host date and time:"
                value={
                  tripDetails.checkedInByHostDateTime?.toUTCString() ?? "-"
                }
                readOnly={true}
              />
              <RntInput
                id="startFuelLevel"
                label="Start fuel level in gal:"
                value={tripDetails.startFuelLevelInGal?.toString() ?? "-"}
                readOnly={true}
              />
              <RntInput
                id="startOdometr"
                label="Start odometr:"
                value={tripDetails.startOdometr?.toString() ?? "-"}
                readOnly={true}
              />
              <RntInput
                id="checkedInByGuestDateTime"
                label="Checked-in by guest date and time:"
                value={
                  tripDetails.checkedInByGuestDateTime?.toUTCString() ?? "-"
                }
                readOnly={true}
              />
              <RntInput
                id="checkedOutByGuestDateTime"
                label="Checked-out by guest date and time:"
                value={
                  tripDetails.checkedOutByGuestDateTime?.toUTCString() ?? "-"
                }
                readOnly={true}
              />
              <RntInput
                id="endFuelLevel"
                label="End fuel level in gal:"
                value={tripDetails.endFuelLevelInGal?.toString() ?? "-"}
                readOnly={true}
              />
              <RntInput
                id="endOdometr"
                label="End odometr:"
                value={tripDetails.endOdometr?.toString() ?? "-"}
                readOnly={true}
              />
              <RntInput
                id="checkedOutByHostDateTime"
                label="Checked-out by host date and time:"
                value={
                  tripDetails.checkedOutByHostDateTime?.toUTCString() ?? "-"
                }
                readOnly={true}
              />
              <RntInput
                id="paymentFrom"
                label="Payment from:"
                value={tripDetails.paymentFrom}
                readOnly={true}
              />
              <RntInput
                id="paymentTo"
                label="Payment to:"
                value={tripDetails.paymentTo}
                readOnly={true}
              />
              <RntInput
                id="pricePerDayInUsdCents"
                label="Price per day in USD:"
                value={tripDetails.pricePerDayInUsdCents.toString()}
                readOnly={true}
              />
              <RntInput
                id="totalDayPriceInUsdCents"
                label="Total day price in USD:"
                value={tripDetails.totalDayPriceInUsd.toString()}
                readOnly={true}
              />
              <RntInput
                id="taxPriceInUsdCents"
                label="Tax price in USD:"
                value={tripDetails.taxPriceInUsd.toString()}
                readOnly={true}
              />
              <RntInput
                id="depositInUsdCents"
                label="Deposit in USD:"
                value={tripDetails.depositInUsd.toString()}
                readOnly={true}
              />
              <RntInput
                id="ethToCurrencyRate"
                label="ETH to currency rate:"
                value={tripDetails.ethToCurrencyRate.toString()}
                readOnly={true}
              />
              <RntInput
                id="resolveAmountInUsdCents"
                label="Resolve amount in USD:"
                value={tripDetails.resolveAmountInUsd?.toString() ?? "-"}
                readOnly={true}
              />
            </div>
            <div className="flex flex-row gap-4 mb-8 mt-4 items-center">
              <RntButton className="w-40 h-16" onClick={() => router.back()}>
                Back
              </RntButton>
            </div>
          </>
        )}
      </div>
    </>
  );
}
