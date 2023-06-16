import HostLayout from "@/components/host/layout/hostLayout";
import TripDetails from "@/components/tripDetails/TripDetails";
import { useRouter } from "next/router";

export default function GuestTripDetails() {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdBigInt = BigInt((tripId as string) ?? "0");
  
  return (
    <HostLayout>
    <TripDetails tripId = {tripIdBigInt}/>
    </HostLayout>
  );
}
