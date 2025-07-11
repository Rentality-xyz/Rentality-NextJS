import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClaimUsers } from '../models/claims';

import PageTitle from '@/components/pageTitle/pageTitle';
import AllClaimsTable from '../components/ClaimsTable';
import AddClaimForm from '../components/AddClaimType';
import AllUsersFilters from '../components/ClaimTypesFilters';

import useRemoveClaimType from '../hooks/useRemoveClaimType';
import useAddClaimType from '../hooks/useAddClaimType';
import { ClaimTypesFilters, useAdminClaimTypesQuery } from '../hooks/useAdminClaimTypes';

const defaultFilters = { claimTypes: ClaimUsers.Both };

function ClaimTypesPageContent() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ClaimTypesFilters>(defaultFilters);

   const {
        data: claimTypes = [],
        isLoading: isFetching,
        isError,
      } = useAdminClaimTypesQuery(filters);

  const {
    mutate: removeClaimType,
  } = useRemoveClaimType();

  const { addClaimType } = useAddClaimType();

  const isLoading = isFetching

  return (
    <>
      <PageTitle title={t('admin_claim_types.page_title')} />
      <AllUsersFilters
      defaultFilters={filters}
      onApply={async (newFilters) => {
        setFilters(newFilters);
      }}
    />

      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
        <AllClaimsTable
          isLoading={isLoading}
          data={claimTypes}
          onDelete={(id) => removeClaimType(id)}
        />

        <PageTitle title={t('admin_claim_types.create_claim_type_title')} />
        <AddClaimForm
        addClaimType={async (name, users) => {
         await addClaimType({ name, users });
        }}
       />        
      </div>
    </>
  );
}

export default ClaimTypesPageContent;
