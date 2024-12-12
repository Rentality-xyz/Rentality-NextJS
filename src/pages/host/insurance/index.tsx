import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageTitle from "@/components/pageTitle/pageTitle";
import AddHostInsurance from "@/components/insurance/AddHostInsurance";
import HostInsuranceFilters from "@/components/insurance/HostInsuranceFilters";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import HostInsuranceTable from "@/components/insurance/HostInsuranceTable";
import useHostInsurances, { HostInsuranceFiltersType } from "@/hooks/insurance/useHostInsurances";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";

const defaultFilters: HostInsuranceFiltersType = {};

function HostInsurance() {
  const itemsPerPage = 10;
  const [filters, setFilters] = useState<HostInsuranceFiltersType>(defaultFilters);
  const { isLoading, data, fetchData } = useHostInsurances();
  const { t } = useTranslation();

  async function handleApplyFilters(filters: HostInsuranceFiltersType) {
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
      <PageTitle title={t("insurance.page_title")} />
      <CheckingLoadingAuth>
        <RntSuspense isLoading={isLoading}>
          <AddHostInsurance />
          <h2 className="mt-4">{t("insurance.insurance_list")}</h2>
          <HostInsuranceFilters defaultFilters={defaultFilters} onApply={handleApplyFilters} />
          <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
            <PaginationWrapper
              currentPage={data.currentPage}
              totalPages={data.totalPageCount}
              selectPage={fetchDataForPage}
            >
              <HostInsuranceTable isLoading={isLoading} data={data.data} />
            </PaginationWrapper>
          </div>
        </RntSuspense>
      </CheckingLoadingAuth>
    </>
  );
}

export default HostInsurance;
