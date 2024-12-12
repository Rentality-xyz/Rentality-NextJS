import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { useTranslation } from "react-i18next";

export function CarTitleAndPrices({
  carTitle,
  pricePerDay,
  pricePerDayWithDiscount,
  tripDays,
  tripDiscounts,
}: {
  carTitle: string;
  pricePerDay: number;
  pricePerDayWithDiscount: number;
  tripDays: number;
  tripDiscounts: {
    discount3DaysAndMoreInPercents: number;
    discount7DaysAndMoreInPercents: number;
    discount30DaysAndMoreInPercents: number;
  };
}) {
  const { t } = useTranslation();

  let discountDays = 0;
  if (tripDays >= 3 && tripDiscounts.discount3DaysAndMoreInPercents) {
    discountDays = 3;
  }
  if (tripDays >= 7 && tripDiscounts.discount7DaysAndMoreInPercents) {
    discountDays = 7;
  }
  if (tripDays >= 30 && tripDiscounts.discount30DaysAndMoreInPercents) {
    discountDays = 30;
  }

  const discountType = discountDays
    ? t("create_trip.n_days_discount", { count: discountDays })
    : t("create_trip.days_discount");
  const discountTotal =
    pricePerDay > pricePerDayWithDiscount ? (pricePerDay - pricePerDayWithDiscount) * tripDays : undefined;

  return (
    <div className="flex flex-wrap items-center justify-between">
      <h1 className="text-3xl">
        <strong>{carTitle}</strong>
      </h1>
      <span className="flex items-center gap-4">
        {discountTotal && (
          <span className="text-2xl text-gray-500">
            <s>${displayMoneyWith2Digits(pricePerDay)}</s>
          </span>
        )}
        <span className="text-3xl">
          <strong>
            ${displayMoneyWith2Digits(pricePerDayWithDiscount)}/{t("common.day")}
          </strong>
        </span>
      </span>

      <span className="flex flex-col items-end text-rentality-secondary">
        <p>{discountType}</p>
        <p>
          ${displayMoneyWith2Digits(discountTotal, "-")}/{t("common.trip")}
        </p>
      </span>
    </div>
  );
}
