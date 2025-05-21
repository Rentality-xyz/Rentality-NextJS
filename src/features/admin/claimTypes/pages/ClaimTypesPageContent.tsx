import { ClaimType, ClaimUsers } from "../models/claims";
import { useEffect, useState } from "react";
import useAdminClaimTypes, { ClaimTypesFilters } from "../hooks/useAdminClaimTypes";
import { useTranslation } from "react-i18next";
import PageTitle from "@/components/pageTitle/pageTitle";
import AllClaimsTable from "../components/ClaimsTable";
import useRemoveClaimType from "../hooks/useRemoveClaimType";
import AddClaimForm from "../components/AddClaimType";
import useAddClaimType from "../hooks/useAddClaimType";
import AllUsersFilters from "../components/ClaimTypesFilters";

const defaultFilters =  {
    claimTypes: ClaimUsers.Both
}

function ClaimTypesPageContent() {
  const [filters, setFilters] = useState<ClaimTypesFilters>(defaultFilters);
  const { isLoading, data, fetchData } = useAdminClaimTypes();
  const { removeClaimType } = useRemoveClaimType();
  const { addClaimType} = useAddClaimType();
  const { t } = useTranslation();

  async function handleApplyFilters(filters: ClaimTypesFilters) {
    setFilters(filters);
    await fetchData(filters);
  }



  useEffect(() => {
    fetchData(defaultFilters);
  }, []);

  return (
    <>
      <PageTitle title={t("admin_claim_types.page_title")} />
      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
    
          <AllClaimsTable isLoading={isLoading} data={data.data} onDelete={removeClaimType}/>
          <PageTitle title={t("admin_claim_types.create_claim_type_title")} />
          <AddClaimForm addClaimType={addClaimType} isLoading={isLoading} />
      </div>
    </>
  );
}

export default ClaimTypesPageContent;