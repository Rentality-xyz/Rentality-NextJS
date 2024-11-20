import { useTranslation } from "react-i18next";
import { HostInsuranceFiltersType } from "@/hooks/insurance/useHostInsurances";
import RntSelect from "../common/rntSelect";
import RntButton from "../common/rntButton";

interface HostInsuranceFiltersProps {
  defaultFilters?: HostInsuranceFiltersType;
  onApply: (filters: HostInsuranceFiltersType) => Promise<void>;
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
