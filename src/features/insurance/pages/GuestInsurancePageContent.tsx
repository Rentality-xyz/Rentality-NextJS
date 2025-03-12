import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageTitle from "@/components/pageTitle/pageTitle";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import RntSuspense from "@/components/common/rntSuspense";
import AddGuestInsurance from "@/features/insurance/components/AddGuestInsurance";
import GuestInsuranceFilters from "@/features/insurance/components/GuestInsuranceFilters";
import GuestInsuranceTable from "@/features/insurance/components/GuestInsuranceTable";
import useFetchInsurances, { InsuranceFiltersType } from "../hooks/useFetchInsurances";

const defaultFilters: InsuranceFiltersType = {};

export default function GuestInsurancePageContent() {
  const itemsPerPage = 10;
  const [filters, setFilters] = useState<InsuranceFiltersType>(defaultFilters);
  const { isLoading, data, fetchData } = useFetchInsurances(false, 1, itemsPerPage);
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
      <RntSuspense isLoading={isLoading}>
        <AddGuestInsurance />
        <h2 className="mt-4 pl-4">{t("insurance.insurance_list")}</h2>
        <GuestInsuranceFilters defaultFilters={defaultFilters} onApply={handleApplyFilters} />
        <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
          <PaginationWrapper
            currentPage={data.currentPage}
            totalPages={data.totalPageCount}
            selectPage={fetchDataForPage}
          >
            <GuestInsuranceTable isLoading={isLoading} data={data.pageData} />
          </PaginationWrapper>
        </div>
      </RntSuspense>
    </>
  );
}
