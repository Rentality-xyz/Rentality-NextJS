import AllTripsTable from "@/components/admin/allTripsTable/AllTripsTable";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";

export default function AllTrips() {
  const isLoading = false;
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title="Car locations" />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <AllTripsTable isHost={true} t={t} />
        )}
      </div>
    </Layout>
  );
}
