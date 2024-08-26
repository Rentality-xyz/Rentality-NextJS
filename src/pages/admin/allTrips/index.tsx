import AllTripsFilters from "@/components/admin/allTripsTable/AllTripsFilters";
import AllTripsTable from "@/components/admin/allTripsTable/AllTripsTable";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useAdminAllTrips, { AdminAllTripsFilters } from "@/hooks/admin/useAdminAllTrips";
import { Result } from "@/model/utils/result";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const defaultFilters: AdminAllTripsFilters = {
  startDateTimeUtc: moment({ day: 1, hour: 0 }).toDate(),
  endDateTimeUtc: moment({ day: 1, hour: 0 }).add(1, "month").toDate(),
};

export default function AllTrips() {
  const itemsPerPage = 10;
  const [filters, setFilters] = useState<AdminAllTripsFilters>(defaultFilters);
  const { isLoading, data, fetchData, payToHost, refundToGuest } = useAdminAllTrips();
  const { t } = useTranslation();

  async function handleApplyFilters(filters: AdminAllTripsFilters) {
    setFilters(filters);
    await fetchData(filters, 1, itemsPerPage);
  }

  async function fetchDataForPage(page: number) {
    await fetchData(filters, page, itemsPerPage);
  }

  async function handlePayToHost(tripId: number): Promise<Result<boolean, string>> {
    const result = await payToHost(tripId);
    if (result.ok) {
      await fetchData(filters, data.currentPage, itemsPerPage);
    }
    return result;
  }

  async function handleRefundToGuest(tripId: number): Promise<Result<boolean, string>> {
    const result = await refundToGuest(tripId);
    if (result.ok) {
      await fetchData(filters, data.currentPage, itemsPerPage);
    }
    return result;
  }

  useEffect(() => {
    fetchData(defaultFilters, 1, itemsPerPage);
  }, [fetchData]);

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("all_trips_table.page_title")} />
        <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
          <AllTripsFilters defaultFilters={defaultFilters} onApply={handleApplyFilters} />
          <PaginationWrapper
            currentPage={data.currentPage}
            totalPages={data.totalPageCount}
            selectPage={fetchDataForPage}
          >
            <AllTripsTable
              isLoading={isLoading}
              data={data.data}
              payToHost={handlePayToHost}
              refundToGuest={handleRefundToGuest}
            />
          </PaginationWrapper>
        </div>
      </div>
    </Layout>
  );
}
