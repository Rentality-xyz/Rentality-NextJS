import { useTranslation } from "react-i18next";
import RntSelect from "@/components/common/rntSelect";
import RntButton from "@/components/common/rntButton";
import { InsuranceFiltersType } from "../hooks/useFetchInsurances";

interface GuestInsuranceFiltersProps {
  defaultFilters?: InsuranceFiltersType;
  onApply: (filters: InsuranceFiltersType) => Promise<void>;
}

export default function GuestInsuranceFilters({ defaultFilters, onApply }: GuestInsuranceFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col self-end">
      <p>{t("insurance.trip_filter")}</p>
      <div className="flex gap-4">
        <RntSelect disabled={true}>
          <option>All</option>
        </RntSelect>
        <RntButton>{t("common.apply")}</RntButton>
      </div>
    </div>
  );
}
