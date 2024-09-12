import AllCarsTable from "@/components/admin/addCars/AllCarsTable";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import PageTitle from "@/components/pageTitle/pageTitle";
import useAdminAllCars from "@/hooks/admin/useAdminAllCars";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function AllCars() {
  const itemsPerPage = 10;
  const { isLoading, data, fetchData } = useAdminAllCars();
  const { t } = useTranslation();

  async function fetchDataForPage(page: number) {
    await fetchData(page, itemsPerPage);
  }

  useEffect(() => {
    fetchData(1, itemsPerPage);
  }, [fetchData]);

  return (
    <>
      <PageTitle title={t("admin_all_cars.page_title")} />
      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
        <PaginationWrapper
          currentPage={data.currentPage}
          totalPages={data.totalPageCount}
          selectPage={fetchDataForPage}
        >
          <AllCarsTable isLoading={isLoading} data={data.data} />
        </PaginationWrapper>
      </div>
    </>
  );
}
