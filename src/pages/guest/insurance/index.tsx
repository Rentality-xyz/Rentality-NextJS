import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageTitle from "@/components/pageTitle/pageTitle";
import AddGuestInsurance from "@/components/insurance/AddGuestInsurance";
import GuestInsuranceFilters from "@/components/insurance/GuestInsuranceFilters";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import GuestInsuranceTable from "@/components/insurance/GuestInsuranceTable";
import useInsurances, { InsuranceFiltersType } from "@/hooks/insurance/useInsurances";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";

const defaultFilters: InsuranceFiltersType = {};

export default function GuestInsurance() {
  const itemsPerPage = 10;
  const [filters, setFilters] = useState<InsuranceFiltersType>(defaultFilters);
  const { isLoading, data, fetchData } = useInsurances(false);
  const { t } = useTranslation();

  async function handleApplyFilters(filters: InsuranceFiltersType) {
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
          <AddGuestInsurance />
          <h2 className="mt-4">{t("insurance.insurance_list")}</h2>
          <GuestInsuranceFilters defaultFilters={defaultFilters} onApply={handleApplyFilters} />
          <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
            <PaginationWrapper
              currentPage={data.currentPage}
              totalPages={data.totalPageCount}
              selectPage={fetchDataForPage}
            >
              <GuestInsuranceTable isLoading={isLoading} data={data.data} />
            </PaginationWrapper>
          </div>
        </RntSuspense>
      </CheckingLoadingAuth>
    </>
  );
}
