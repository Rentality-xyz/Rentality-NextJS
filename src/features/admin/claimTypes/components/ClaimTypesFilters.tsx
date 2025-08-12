import React, { useState } from "react";
import RntButton from "@/components/common/rntButton";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import { ClaimTypesFilters } from "../hooks/useAdminClaimTypes";
import { ClaimUsers } from "../models/claims";
import RntFilterSelect from "@/components/common/RntFilterSelect";

interface AllUsersFiltersProps {
  defaultFilters?: ClaimTypesFilters;
  onApply: (filters: ClaimTypesFilters) => Promise<void>;
}

function AllUsersFilters({ defaultFilters, onApply }: AllUsersFiltersProps) {
  const { t } = useTranslation();
  const t_att: TFunction = (name, options) =>
    t("admin_claim_types." + name, options);

  const [filters, setFilters] = useState<ClaimTypesFilters>(
    defaultFilters || { claimTypes: ClaimUsers.Both }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    setIsLoading(true);
    try {
      await onApply(filters);
    } finally {
      setIsLoading(false);
    }
  };

  const claimTypeOptions = [
    { id: ClaimUsers.Host, labelKey: "host" },
    { id: ClaimUsers.Guest, labelKey: "guest" },
    { id: ClaimUsers.Both, labelKey: "both" },
  ];

  return (
    <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[auto_auto]">
        <div className="flex w-full flex-col gap-2 md:max-w-[300px]">
          <label className="text-sm font-medium">{t_att("filter_by")}</label>
          <RntFilterSelect
            value={String(filters.claimTypes)}
            onChange={(e) => {
              if (e.target.value === "") return
              const selectedId = Number(e.target.value) as ClaimUsers;
              setFilters((prev) => ({
                ...prev,
                claimTypes: selectedId,
              }));
            }}
            className="w-full"
          >
            {claimTypeOptions.map(({ id, labelKey }) => (
              <RntFilterSelect.Option
                key={id}
                value={String(id)}
              >
                {t_att(labelKey)}
              </RntFilterSelect.Option>
            ))}
          </RntFilterSelect>

        </div>

        <RntButton onClick={handleApply} disabled={isLoading}>
          {t_att("filter_apply")}
        </RntButton>
      </div>
    </div>
  );
}

export default AllUsersFilters;
