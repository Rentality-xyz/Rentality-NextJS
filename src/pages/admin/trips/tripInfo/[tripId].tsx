import Layout from "@/components/layout/layout";
import TripDetails from "@/components/tripDetails/TripDetails";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

export default function AdminTripDetails() {
  const router = useRouter();
  const { tripId, back } = router.query;
  const tripIdBigInt = BigInt((tripId as string) ?? "0");
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex flex-col">
        <TripDetails tripId={tripIdBigInt} backPath={back as string} t={t} />
      </div>
    </Layout>
  );
}
