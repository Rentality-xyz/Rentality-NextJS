import RntButton from "@/components/common/rntButton";
import HostLayout from "@/components/host/layout/hostLayout";
import TripDetails from "@/components/tripDetails/TripDetails";
import { useRouter } from "next/router";

export default function GuestTripDetails() {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdBigInt = BigInt((tripId as string) ?? "0");

  return (
    <HostLayout>
      <TripDetails tripId={tripIdBigInt} />
      <div className="flex flex-row gap-4 mb-8 mt-4 items-center  px-8">
        <RntButton className="w-40 h-16" onClick={() => router.back()}>
          Back
        </RntButton>
      </div>
    </HostLayout>
  );
}
