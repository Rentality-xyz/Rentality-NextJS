import { useEffect } from "react";
import PageTitle from "@/components/pageTitle/pageTitle";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import useAdminAllCars from "@/features/admin/allCars/hooks/useAdminAllCars";
import useCarAPI from "@/hooks/useCarAPI";
import { useTranslation } from "react-i18next";
import AllCarsRntTable from "@/features/admin/allCars/components/AllCarsRntTable";

function AllCarsPageContent() {
  const itemsPerPage = 25;
  const { isLoading, data, fetchData } = useAdminAllCars();
  const { getVINNumber } = useCarAPI();
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
          <AllCarsRntTable isLoading={isLoading} data={data.data} checkVin={getVINNumber} />
        </PaginationWrapper>
      </div>
    </>
  );
}

export default AllCarsPageContent;
