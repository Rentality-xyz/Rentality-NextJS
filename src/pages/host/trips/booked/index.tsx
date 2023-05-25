import HostLayout from "@/components/host/layout/hostLayout";
import TripItem, { TripInfo, TripStatus } from "@/components/host/tripItem";
import useHostTrips from "@/hooks/host/useHostTrips";
import { useRouter } from "next/router";

export default function Booked() {
  const [dataFetched, tripsBooked, _ ,acceptRequest, rejectRequest, finishTrip] = useHostTrips();
  const router = useRouter();

  const acceptTripRequest = async (tripId: number) => {
    //e.preventDefault();

    try {
      //setMessage("Please wait.. uploading (upto 5 mins)");
      // if (saveButtonRef.current) {
      //   saveButtonRef.current.disabled = true;
      // }
      const result = await acceptRequest(tripId);

      if (!result) {
        throw new Error("acceptRequest error");
      }
      alert("Successfully accepted car request!");
      router.reload();
    } catch (e) {
      alert("acceptTripRequest error" + e);
      // if (saveButtonRef.current) {
      //   saveButtonRef.current.disabled = false;
      // }
    }
  };

  const rejectTripRequest = async (tripId: number) => {
    //e.preventDefault();

    try {
      //setMessage("Please wait.. uploading (upto 5 mins)");
      // if (saveButtonRef.current) {
      //   saveButtonRef.current.disabled = true;
      // }
      const result = await rejectRequest(tripId);

      if (!result) {
        throw new Error("rejectRequest error");
      }
      alert("Successfully accepted car request!");
      router.reload();
    } catch (e) {
      alert("rejectTripRequest error" + e);
      // if (saveButtonRef.current) {
      //   saveButtonRef.current.disabled = false;
      // }
    }
  };

  return (
    <HostLayout>
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
                    acceptRequest={acceptTripRequest}
                    rejectRequest={rejectTripRequest}
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
    </HostLayout>
  );
}
