import React, { useState } from "react";
import RntButton from "@/components/common/rntButton";
import RntSelect from "@/components/common/rntSelect";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import { ClaimTypesFilters } from "../hooks/useAdminClaimTypes";
import { ClaimUsers } from "../models/claims";

interface AllUsersFiltersProps {
  defaultFilters?: ClaimTypesFilters;
  onApply: (filters: ClaimTypesFilters) => Promise<void>;
}

function AllUsersFilters({ defaultFilters, onApply }: AllUsersFiltersProps) {
  const { t } = useTranslation();
  const t_att: TFunction = (name, options) => t("admin_claim_types." + name, options);
  
  const [filters, setFilters] = useState<ClaimTypesFilters>(defaultFilters || {});
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    setIsLoading(true);
    try {
      await onApply(filters);
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-[auto_auto] gap-4 items-end">
        <div className="flex flex-col gap-2 w-full md:max-w-[300px]">
          <label className="font-medium text-sm">{t_att("filter_by")}</label>
          <RntSelect
            value={filters.claimTypes ?? ClaimUsers.Both}
            onChange={(e) => setFilters({ ...filters, claimTypes: e.target.value as unknown as ClaimUsers })}
            className="w-full"
          >
            <option value={ClaimUsers.Host}>{t_att("host")}</option>
            <option value={ClaimUsers.Guest}>{t_att("guest")}</option>
            <option value={ClaimUsers.Both}>{t_att("both")}</option>
          </RntSelect>
        </div>

        <RntButton
          onClick={handleApply}
          disabled={isLoading}
        >
          {t_att("filter_apply")}
        </RntButton>
      </div>
    </div>
  );
}

export default AllUsersFilters;