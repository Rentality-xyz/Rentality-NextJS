import { useTranslation } from "react-i18next";
import { TripDiscountsFormValues } from "../host/tripDiscountsFormSchema";

export function CreateTripDiscounts({ tripDiscounts }: { tripDiscounts: TripDiscountsFormValues }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <h3 className="mb-2 text-xl">{t("create_trip.discounts")}</h3>
      <p>
        <span className="text-rentality-secondary">{t("create_trip.3_day_discount")}</span>{" "}
        {tripDiscounts.discount3DaysAndMoreInPercents}%
      </p>
      <p>
        <span className="text-rentality-secondary">{t("create_trip.7_day_discount")}</span>{" "}
        {tripDiscounts.discount7DaysAndMoreInPercents}%
      </p>
      <p>
        <span className="text-rentality-secondary">{t("create_trip.30_day_discount")}</span>{" "}
        {tripDiscounts.discount30DaysAndMoreInPercents}%
      </p>
    </div>
  );
}
