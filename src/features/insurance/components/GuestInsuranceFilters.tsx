import { useTranslation } from "react-i18next";
import RntSelect from "@/components/common/rntSelect";
import RntButton from "@/components/common/rntButton";
import { InsuranceFiltersType } from "../hooks/useFetchInsurances";
import RntFilterSelect from "@/components/common/RntFilterSelect";
import { Controller, useForm } from "react-hook-form";
import * as React from "react";

interface GuestInsuranceFiltersProps {
  defaultFilters?: InsuranceFiltersType;
  onApply: (filters: InsuranceFiltersType) => Promise<void>;
}

export default function GuestInsuranceFilters({ defaultFilters, onApply }: GuestInsuranceFiltersProps) {
  const { t } = useTranslation();
  const { control } = useForm();

  return (
    <div className="flex flex-col sm:self-end">
      <div className="flex items-center gap-4">
        <Controller
          name="currentlyListed"
          control={control}
          render={({ field }) => (
            <RntFilterSelect
              className="w-24"
              value={field.value ?? "All"}
              disabled={true}
              label={t("insurance.trip_filter")}
              onChange={(e) => {
                field.onChange(e);
              }}
            >
              <RntFilterSelect.Option key="guest-insurance-filters" value="All">
                All
              </RntFilterSelect.Option>
            </RntFilterSelect>
          )}
        />
        <RntButton className="mt-7">{t("common.apply")}</RntButton>
      </div>
    </div>
  );
}
