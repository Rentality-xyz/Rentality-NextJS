import PaginationWrapper from "@/components/common/PaginationWrapper";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useAdminAllUsers, { AdminAllUsersFilters, UserType } from "../hooks/useAdminAllUsers";
import AllUsersFilters from "../components/AllUsersFilters";
import AllUsersTable from "../components/AllUsersTable";

const defaultFilters: AdminAllUsersFilters = {
  userType: UserType.Any,
};

function AllUsersPageContent() {
  const itemsPerPage = 10;
  const [filters, setFilters] = useState<AdminAllUsersFilters>(defaultFilters);
  const { isLoading, data, fetchData } = useAdminAllUsers();
  const { t } = useTranslation();

  async function handleApplyFilters(filters: AdminAllUsersFilters) {
    setFilters(filters);
    await fetchData(filters, 1, itemsPerPage);
  }

  async function fetchDataForPage(page: number) {
    await fetchData(filters, page, itemsPerPage);
  }

  useEffect(() => {
    fetchData(defaultFilters, 1, itemsPerPage);
  }, [fetchData]);

  return (
    <>
      <PageTitle title={t("all_trips_table.page_title")} />
      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
        <AllUsersFilters defaultFilters={defaultFilters} onApply={handleApplyFilters} />
        <PaginationWrapper
          currentPage={data.currentPage}
          totalPages={data.totalPageCount}
          selectPage={fetchDataForPage}
        >
          <AllUsersTable isLoading={isLoading} data={data.data} />
        </PaginationWrapper>
      </div>
    </>
  );
}

export default AllUsersPageContent;
