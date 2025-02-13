import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageTitle from "@/components/pageTitle/pageTitle";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import AddHostInsurance from "@/features/insurance/components/AddHostInsurance";
import HostInsuranceFilters from "@/features/insurance/components/HostInsuranceFilters";
import HostInsuranceTable from "@/features/insurance/components/HostInsuranceTable";
import useFetchInsurances, { InsuranceFiltersType } from "../hooks/useFetchInsurances";

const defaultFilters: InsuranceFiltersType = {};

export default function HostInsurancePageContent() {
  const itemsPerPage = 10;
  const [filters, setFilters] = useState<InsuranceFiltersType>(defaultFilters);
  const { isLoading, data, fetchData } = useFetchInsurances(true, 1, itemsPerPage);
  const { t } = useTranslation();

  async function handleApplyFilters(filters: InsuranceFiltersType) {
    setFilters(filters);
    await fetchData(1, itemsPerPage, filters);
  }

  async function fetchDataForPage(page: number) {
    await fetchData(page, itemsPerPage, filters);
  }

  return (
    <>
      <PageTitle title={t("insurance.page_title")} />
      <CheckingLoadingAuth>
        <RntSuspense isLoading={isLoading}>
          <AddHostInsurance onNewInsuranceAdded={handleNewInsuranceAdded} />
          <h2 className="mt-4">{t("insurance.insurance_list")}</h2>
          <HostInsuranceFilters defaultFilters={defaultFilters} onApply={handleApplyFilters} />
          <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
            <PaginationWrapper
              currentPage={data.currentPage}
              totalPages={data.totalPageCount}
              selectPage={fetchDataForPage}
            >
              <HostInsuranceTable isLoading={isLoading} data={data.pageData} />
            </PaginationWrapper>
          </div>
        </RntSuspense>
      </CheckingLoadingAuth>
    </>
  );
}
