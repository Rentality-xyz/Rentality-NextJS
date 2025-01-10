import { useTranslation } from "react-i18next";
import RntSelect from "../common/rntSelect";
import RntButton from "../common/rntButton";
import { InsuranceFiltersType } from "@/hooks/insurance/useInsurances";

interface HostInsuranceFiltersProps {
  defaultFilters?: InsuranceFiltersType;
  onApply: (filters: InsuranceFiltersType) => Promise<void>;
}

export default function HostInsuranceFilters({ defaultFilters, onApply }: HostInsuranceFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col self-end">
      <p>{t("insurance.trip_filter")}</p>
      <div className="flex gap-4">
        <RntSelect>
          <option value={"none"}>All</option>
        </RntSelect>
        <RntButton>{t("common.apply")}</RntButton>
      </div>
    </div>
  );
}
