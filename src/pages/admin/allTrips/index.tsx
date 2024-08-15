import AllTripsFilters from "@/components/admin/allTripsTable/AllTripsFilters";
import AllTripsTable from "@/components/admin/allTripsTable/AllTripsTable";
import Loading from "@/components/common/Loading";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useAdminAllTrips, { AdminAllTripsFilters } from "@/hooks/admin/useAdminAllTrips";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function AllTrips() {
  const { isLoading, data, fetchData, payToHost, refundToGuest } = useAdminAllTrips();
  const [filters, setFilters] = useState<AdminAllTripsFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(1000);
  const { t } = useTranslation();

  async function handleApplyFilters(filters: AdminAllTripsFilters) {
    setFilters(filters);
    setCurrentPage(1);
    await fetchData(filters, 1, itemsPerPage);
  }

  async function handleMoveToPage(page: number) {
    setCurrentPage(page);
    await fetchData(filters, page, itemsPerPage);
  }

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("all_trips_table.page_title")} />
        <AllTripsFilters onApply={handleApplyFilters} />
        {isLoading && <Loading />}
        {!isLoading && <AllTripsTable data={data.data} payToHost={payToHost} refundToGuest={refundToGuest} />}
      </div>
    </Layout>
  );
}
