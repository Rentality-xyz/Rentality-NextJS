import GuestLayout from "@/components/guest/layout/guestLayout";
import TripItem, { TripInfo, TripStatus } from "@/components/guest/tripItem";

export default function History() {
  const mockTripInfo: TripInfo = {
    tripId: 1,
    carId: 1,
    brand: "Ford",
    model: "Mustang",
    year: "2023",
    licensePlate: "EE 099 TVQ",
    image: "",
    tripStart: "April 10, 4:00 AM",
    tripEnd: "April 20, 4:00 AM",
    locationStart: "Miami, CA, USA",
    locationEnd: "Miami, CA, USA",
    status: TripStatus.Closed,
  };

  return (
    <GuestLayout>
      <div className="flex flex-col px-8 pt-4">
        <div className="text-2xl">History</div>
        <div className="flex flex-col gap-4 pr-4 my-4">
          <TripItem tripInfo={{ ...mockTripInfo, tripId: 1 }} />
          <TripItem tripInfo={{ ...mockTripInfo, tripId: 2 }} />
          <TripItem tripInfo={{ ...mockTripInfo, tripId: 3 }} />
          <TripItem tripInfo={{ ...mockTripInfo, tripId: 4 }} />
          <TripItem tripInfo={{ ...mockTripInfo, tripId: 5 }} />
        </div>
      </div>
    </GuestLayout>
  );
}
