import RntButton from "@/components/common/rntButton";
import GuestLayout from "@/components/guest/layout/guestLayout";
import TripDetails from "@/components/tripDetails/TripDetails";
import { useRouter } from "next/router";

export default function GuestTripDetails() {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdBigInt = BigInt((tripId as string) ?? "0");

  return (
    <GuestLayout>
      <div className="flex flex-col">
        <TripDetails tripId={tripIdBigInt} />
      </div>
    </GuestLayout>
  );
}
