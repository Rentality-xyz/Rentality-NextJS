import AllTripsFilters from "@/components/admin/allTripsTable/AllTripsFilters";
import AllTripsTable from "@/components/admin/allTripsTable/AllTripsTable";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useAdminAllTrips, { AdminAllTripsFilters } from "@/hooks/admin/useAdminAllTrips";
import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const defaultFilters: AdminAllTripsFilters = {
  startDateTimeUtc: moment({ hour: 0 }).subtract(1, "month").toDate(),
  endDateTimeUtc: moment({ hour: 0 }).toDate(),
};

export default function AllTrips() {
  const itemsPerPage = 10;
  const [filters, setFilters] = useState<AdminAllTripsFilters>(defaultFilters);
  const { isLoading, data, fetchData, payToHost, refundToGuest } = useAdminAllTrips(defaultFilters, itemsPerPage);
  const { t } = useTranslation();
  const pageCount = !isLoading ? Math.ceil(data.totalCount / itemsPerPage) : 0;

  async function handleApplyFilters(filters: AdminAllTripsFilters) {
    setFilters(filters);
    await fetchData(filters, 0);
  }

  async function fetchDataForPage(page: number) {
    await fetchData(filters, page);
  }

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("all_trips_table.page_title")} />
        <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
          <AllTripsFilters defaultFilters={defaultFilters} onApply={handleApplyFilters} />
          <PaginationWrapper currentPage={data.currentPage} totalPages={pageCount} setCurrentPage={fetchDataForPage}>
            <AllTripsTable isLoading={isLoading} data={data.data} payToHost={payToHost} refundToGuest={refundToGuest} />
          </PaginationWrapper>
        </div>
      </div>
    </Layout>
  );
}
