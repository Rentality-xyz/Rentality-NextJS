import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageTitle from "@/components/pageTitle/pageTitle";
import AddGuestInsurance from "@/components/insurance/AddGuestInsurance";
import GuestInsuranceFilters from "@/components/insurance/GuestInsuranceFilters";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import GuestInsuranceTable from "@/components/insurance/GuestInsuranceTable";
import useGuestInsurances, { GuestInsuranceFiltersType } from "@/hooks/insurance/useGuestInsurances";

const defaultFilters: GuestInsuranceFiltersType = {};

export default function GuestInsurance() {
  const itemsPerPage = 10;
  const [filters, setFilters] = useState<GuestInsuranceFiltersType>(defaultFilters);
  const { isLoading, data, fetchData } = useGuestInsurances();
  const { t } = useTranslation();

  async function handleApplyFilters(filters: GuestInsuranceFiltersType) {
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
      <p>{t("insurance.please_enter_your_insurance")}</p>
      <AddGuestInsurance />
      <p>{t("insurance.insurance_list")}</p>
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
    </>
  );
}
