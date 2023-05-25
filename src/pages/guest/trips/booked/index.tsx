import GuestLayout from "@/components/guest/layout/guestLayout";
import TripItem from "@/components/guest/tripItem";
import useGuestTrips from "@/hooks/guest/useGuestTrips";
import { useRouter } from "next/router";

export default function Booked() {
  const [dataFetched, tripsBooked, _, finishTrip] = useGuestTrips();
  const router = useRouter();

  const finishTripRequest = async (tripId: number) => {
    //e.preventDefault();

    try {
      //setMessage("Please wait.. uploading (upto 5 mins)");
      // if (saveButtonRef.current) {
      //   saveButtonRef.current.disabled = true;
      // }
      const result = await finishTrip(tripId);

      if (!result) {
        throw new Error("finishTrip error");
      }
      alert("Successfully finished trip!");
      router.reload();
    } catch (e) {
      alert("finishTripRequest error" + e);
      // if (saveButtonRef.current) {
      //   saveButtonRef.current.disabled = false;
      // }
    }
  };

  return (
    <GuestLayout>
      <div className="flex flex-col px-8 pt-4">
        <div className="text-2xl">Booked</div>
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <div className="my-4 flex flex-col gap-4 pr-4">
            {tripsBooked != null && tripsBooked.length > 0 ? (
              tripsBooked.map((value) => {
                return (
                  <TripItem
                    key={value.tripId}
                    tripInfo={value}
                    finishTrip={finishTrip}
                  />
                );
              })
            ) : (
              <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
                You dont have booked trips
              </div>
            )}
          </div>
        )}
      </div>
    </GuestLayout>
  );
}
