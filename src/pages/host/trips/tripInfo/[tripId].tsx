import Layout from "@/components/layout/layout";
import RntButton from "@/components/common/rntButton";
import TripDetails from "@/components/tripDetails/TripDetails";
import { useRouter } from "next/router";

export default function GuestTripDetails() {
  const router = useRouter();
  const { tripId } = router.query;
  const tripIdBigInt = BigInt((tripId as string) ?? "0");

  return (
    <Layout>
      <div className="flex flex-col">
        <TripDetails tripId={tripIdBigInt} />
      </div>
    </Layout>
  );
}
