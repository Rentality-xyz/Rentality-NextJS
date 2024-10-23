import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { useTranslation } from "react-i18next";

export function TripConditions({
  pricePerDay,
  securityDeposit,
  milesIncludedPerDay,
  pricePer10PercentFuel,
  deliveryPrices,
  insuranceDetails,
}: {
  pricePerDay: number;
  securityDeposit: number;
  milesIncludedPerDay: number;
  pricePer10PercentFuel: number;
  deliveryPrices: {
    from1To25milesPrice: number;
    over25MilesPrice: number;
  };
  insuranceDetails: {
    isInsuranceRequired: boolean;
    insurancePerDayPriceInUsd: number;
    isGuestHasInsurance: boolean;
  };
}) {
  const { t } = useTranslation();

  const fuelPricePerMile = Math.ceil((Number(pricePerDay) * 100) / Number(milesIncludedPerDay)) / 100;
  const fuelPricePerMileText = Number.isFinite(fuelPricePerMile)
    ? `$${displayMoneyWith2Digits(fuelPricePerMile)}`
    : "-";
  const insuranceText = !insuranceDetails.isInsuranceRequired
    ? t("create_trip.insurance_not_required")
    : insuranceDetails.isGuestHasInsurance
      ? t("create_trip.insurance_required_and_guest_has")
      : t("create_trip.insurance_required_and_guest_does_not_have", {
          insurancePerDayPriceInUsd: insuranceDetails.insurancePerDayPriceInUsd,
        });
  const milesIncludedPerDayText = t("create_trip.n_miles", { milesIncludedPerDay: milesIncludedPerDay });

  return (
    <div className="flex flex-col">
      <h3 className="mb-2 text-xl">{t("create_trip.trip_conditions")}</h3>
      <TripConditionsRow title={t("create_trip.insurance")} value={insuranceText} />
      <TripConditionsRow
        title={t("create_trip.price")}
        value={`$${displayMoneyWith2Digits(pricePerDay)}/${t("common.day")}`}
      />
      <TripConditionsRow
        title={t("create_trip.security_deposit")}
        value={`${displayMoneyWith2Digits(securityDeposit)}/${t("common.trip")}`}
      />
      <TripConditionsRow title={t("create_trip.daily_mileage")} value={milesIncludedPerDayText} />
      <TripConditionsRow title={t("create_trip.price_per_overmile")} value={fuelPricePerMileText} />
      <TripConditionsRow
        title={t("create_trip.price_per_10_tank")}
        value={`$${displayMoneyWith2Digits(pricePer10PercentFuel)}`}
      />
      <TripConditionsRow
        title={t("create_trip.delivery_fee")}
        value={t("create_trip.delivery_fee_value", {
          from1To25milesPrice: displayMoneyWith2Digits(deliveryPrices.from1To25milesPrice),
          over25MilesPrice: displayMoneyWith2Digits(deliveryPrices.over25MilesPrice),
        })}
      />
      <TripConditionsRow title={t("create_trip.cancellation")} value={t("create_trip.cancellation_value")} />
      <TripConditionsRow title={t("create_trip.taxes")} value={t("create_trip.taxes_value")} />
    </div>
  );
}

function TripConditionsRow({ title, value }: { title: string; value: string }) {
  return (
    <p>
      <span className="text-rentality-secondary">{title}: </span>
      {value}
    </p>
  );
}
