import HostLayout from "@/components/host/layout/hostLayout";
import InputBlock from "@/components/inputBlock";
import useTripDetails from "@/hooks/useTripInfo";
import { useRouter } from "next/router";

export default function TripDetails() {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdBigInt = BigInt((tripId as string) ?? "0");
  const [dataFetched, tripDetails] = useTripDetails(tripIdBigInt);

  if (tripId == null) return null;

  return (
    <HostLayout>
      <div className="flex flex-col px-8 pt-4">
        <div className="text-2xl">Trip #{tripId} details</div>
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <div className="my-4 grid grid-cols-2 gap-4 pr-4">
            <div className="flex flex-row gap-4">
              <InputBlock
                id="tripId"
                label="Trip id:"
                value={tripDetails.tripId.toString()}
                readOnly={true}
              />
              <InputBlock
                id="carId"
                label="Car id:"
                value={tripDetails.carId.toString()}
                readOnly={true}
              />
            </div>
            <InputBlock
              id="status"
              label="Status:"
              value={tripDetails.status}
              readOnly={true}
            />
            <InputBlock
              id="host"
              label="Host address:"
              value={tripDetails.host}
              readOnly={true}
            />
            <InputBlock
              id="guest"
              label="Guest address:"
              value={tripDetails.guest}
              readOnly={true}
            />
            <InputBlock
              id="startDateTime"
              label="Start date and time:"
              value={tripDetails.startDateTime.toUTCString()}
              readOnly={true}
            />
            <InputBlock
              id="endDateTime"
              label="End date and time:"
              value={tripDetails.endDateTime.toUTCString()}
              readOnly={true}
            />
            <InputBlock
              id="startLocation"
              label="Start Location:"
              value={tripDetails.startLocation}
              readOnly={true}
            />
            <InputBlock
              id="endLocation"
              label="End Location:"
              value={tripDetails.endLocation}
              readOnly={true}
            />
            <InputBlock
              id="milesIncluded"
              label="Miles included:"
              value={tripDetails.milesIncluded.toString()}
              readOnly={true}
            />
            <InputBlock
              id="fuelPricePerGalInUsdCents"
              label="Fuel price per gal in USD:"
              value={tripDetails.fuelPricePerGalInUsd.toString()}
              readOnly={true}
            />
            <InputBlock
              id="approvedDateTime"
              label="Approved date and time:"
              value={tripDetails.approvedDateTime?.toUTCString()??"-"}
              readOnly={true}
            />
            <InputBlock
              id="checkedInByHostDateTime"
              label="Checked-in by host date and time:"
              value={tripDetails.checkedInByHostDateTime?.toUTCString()??"-"}
              readOnly={true}
            />
            <InputBlock
              id="startFuelLevel"
              label="Start fuel level in gal:"
              value={tripDetails.startFuelLevelInGal?.toString()??"-"}
              readOnly={true}
            />
            <InputBlock
              id="startOdometr"
              label="Start odometr:"
              value={tripDetails.startOdometr?.toString()??"-"}
              readOnly={true}
            />
            <InputBlock
              id="checkedInByGuestDateTime"
              label="Checked-in by guest date and time:"
              value={tripDetails.checkedInByGuestDateTime?.toUTCString()??"-"}
              readOnly={true}
            />
            <InputBlock
              id="checkedOutByGuestDateTime"
              label="Checked-out by guest date and time:"
              value={tripDetails.checkedOutByGuestDateTime?.toUTCString()??"-"}
              readOnly={true}
            />
            <InputBlock
              id="endFuelLevel"
              label="End fuel level in gal:"
              value={tripDetails.endFuelLevelInGal?.toString()??"-"}
              readOnly={true}
            />
            <InputBlock
              id="endOdometr"
              label="End odometr:"
              value={tripDetails.endOdometr?.toString()??"-"}
              readOnly={true}
            />
            <InputBlock
              id="checkedOutByHostDateTime"
              label="Checked-out by host date and time:"
              value={tripDetails.checkedOutByHostDateTime?.toUTCString()??"-"}
              readOnly={true}
            />
            <InputBlock
              id="paymentFrom"
              label="Payment from:"
              value={tripDetails.paymentFrom}
              readOnly={true}
            />
            <InputBlock
              id="paymentTo"
              label="Payment to:"
              value={tripDetails.paymentTo}
              readOnly={true}
            />
            <InputBlock
              id="pricePerDayInUsdCents"
              label="Price per day in USD:"
              value={tripDetails.pricePerDayInUsdCents.toString()}
              readOnly={true}
            />
            <InputBlock
              id="totalDayPriceInUsdCents"
              label="Total day price in USD:"
              value={tripDetails.totalDayPriceInUsd.toString()}
              readOnly={true}
            />
            <InputBlock
              id="taxPriceInUsdCents"
              label="Tax price in USD:"
              value={tripDetails.taxPriceInUsd.toString()}
              readOnly={true}
            />
            <InputBlock
              id="depositInUsdCents"
              label="Deposit in USD:"
              value={tripDetails.depositInUsd.toString()}
              readOnly={true}
            />
            <InputBlock
              id="ethToCurrencyRate"
              label="ETH to currency rate:"
              value={tripDetails.ethToCurrencyRate.toString()}
              readOnly={true}
            />
            <InputBlock
              id="resolveAmountInUsdCents"
              label="Resolve amount in USD:"
              value={tripDetails.resolveAmountInUsd?.toString()??"-"}
              readOnly={true}
            />
          </div>
        )}
      </div>
    </HostLayout>
  );
}
