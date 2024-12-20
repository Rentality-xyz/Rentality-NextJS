import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useTranslation } from "react-i18next";

export function CreateTripGuestInsurance({
  insuranceDetails,
}: {
  insuranceDetails: {
    isInsuranceRequired: boolean;
    insurancePerDayPriceInUsd: number;
    isGuestHasInsurance: boolean;
  };
}) {
  const { showDialog } = useRntDialogs();
  const { t } = useTranslation();

  function handleInfoClick() {
    showDialog(t("profile.user_insurance.insurance_info"));
  }

  const insuranceText = !insuranceDetails.isInsuranceRequired
    ? t("create_trip.insurance_not_required")
    : insuranceDetails.isGuestHasInsurance
      ? t("create_trip.insurance_required_and_guest_has")
      : t("create_trip.this_trip_includes_insurance", {
          insurancePerDayPriceInUsd: insuranceDetails.insurancePerDayPriceInUsd,
        });

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row items-center gap-2 text-rentality-secondary" onClick={handleInfoClick}>
        <span className="mb-1">{t("create_trip.guest_insurance")}</span>
        <i className="fi fi-rs-info"></i>
      </div>
      <p>{insuranceText}</p>
    </div>
  );
}
