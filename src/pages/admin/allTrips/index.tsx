import AllTripsFilters from "@/components/admin/allTripsTable/AllTripsFilters";
import AllTripsTable from "@/components/admin/allTripsTable/AllTripsTable";
import Loading from "@/components/common/Loading";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useAdminAllTrips, { AdminAllTripsFilters } from "@/hooks/admin/useAdminAllTrips";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AllTrips() {
  const { isLoading, data, fetchData } = useAdminAllTrips();
  const [filters, setFilters] = useState<AdminAllTripsFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(1000);
  const { t } = useTranslation();

  const handleApplyFilters = async (filters: AdminAllTripsFilters) => {
    setFilters(filters);
    setCurrentPage(1);
    fetchData(filters, 1, itemsPerPage);
  };

  const handleMoveToPage = async (page: number) => {
    setCurrentPage(page);
    fetchData(filters, page, itemsPerPage);
  };

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("all_trips_table.page_title")} />
        <AllTripsFilters onApply={handleApplyFilters} />
        {isLoading && <Loading />}
        {!isLoading && <AllTripsTable data={data.data} />}
      </div>
    </Layout>
  );
}
