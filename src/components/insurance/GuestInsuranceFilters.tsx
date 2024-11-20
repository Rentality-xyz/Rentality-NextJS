import { useTranslation } from "react-i18next";
import RntSelect from "../common/rntSelect";
import RntButton from "../common/rntButton";
import { GuestInsuranceFiltersType } from "@/hooks/insurance/useGuestInsurances";

interface GuestInsuranceFiltersProps {
  defaultFilters?: GuestInsuranceFiltersType;
  onApply: (filters: GuestInsuranceFiltersType) => Promise<void>;
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
