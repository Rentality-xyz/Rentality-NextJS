import { useEffect, useState } from "react";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import PageTitle from "@/components/pageTitle/pageTitle";
import useAdminAllTrips, { AdminAllTripsFilters } from "@/features/admin/allTrips/hooks/useAdminAllTrips";
import AllTripsFilters from "@/features/admin/allTrips/components/AllTripsFilters";
import { Result } from "@/model/utils/result";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { AllTripsRntTable } from "@/features/admin/allTrips/components/AllTripsRntTable";

const defaultFilters: AdminAllTripsFilters = {
  startDateTimeUtc: moment({ day: 1, hour: 0 }).toDate(),
  endDateTimeUtc: moment({ day: 1, hour: 0 }).add(1, "month").toDate(),
};

export default function AllTripsPageContent() {
  const itemsPerPage = 25;
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
    <>
      <PageTitle title={t("all_trips_table.page_title")} />
      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
        <AllTripsFilters defaultFilters={defaultFilters} onApply={handleApplyFilters} />
        <PaginationWrapper
          currentPage={data.currentPage}
          totalPages={data.totalPageCount}
          selectPage={fetchDataForPage}
        >
          <AllTripsRntTable
            isLoading={isLoading}
            dataPage={data.data}
            filters={filters}
            payToHost={handlePayToHost}
            refundToGuest={handleRefundToGuest}
          />
        </PaginationWrapper>
      </div>
    </>
  );
}
