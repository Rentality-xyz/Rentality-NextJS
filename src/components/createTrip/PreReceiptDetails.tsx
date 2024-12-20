import { DeliveryDetails } from "@/model/SearchCarsResult";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { useTranslation } from "react-i18next";

export function PreReceiptDetails({
  pricePerDay,
  pricePerDayWithDiscount,
  tripDays,
  deliveryDetails,
  salesTax,
  governmentTax,
  securityDeposit,
  insuranceDetails,
}: {
  pricePerDay: number;
  pricePerDayWithDiscount: number;
  tripDays: number;
  deliveryDetails: DeliveryDetails;
  salesTax: number;
  governmentTax: number;
  securityDeposit: number;
  insuranceDetails: {
    isInsuranceRequired: boolean;
    insurancePerDayPriceInUsd: number;
    isGuestHasInsurance: boolean;
  };
}) {
  const { t } = useTranslation();

  const insuranceCharge =
    insuranceDetails.isInsuranceRequired && !insuranceDetails.isGuestHasInsurance
      ? insuranceDetails.insurancePerDayPriceInUsd * tripDays
      : 0;

  const totalCharge =
    pricePerDayWithDiscount * tripDays +
    deliveryDetails.pickUp.priceInUsd +
    deliveryDetails.dropOff.priceInUsd +
    salesTax +
    governmentTax;

  return (
    <div className="mt-4 grid grid-cols-[auto_1fr] items-end gap-1 bg-rentality-bg px-2">
      <h3 className="col-span-2 mx-auto mb-2 text-rentality-secondary">
        {t("create_trip.see_trip_pre_receipt_details")}
      </h3>
      <hr className="col-span-2" />

      <p>{t("create_trip.price_per_day")}</p>
      <p className="text-right">${displayMoneyWith2Digits(pricePerDay)}</p>

      <p>{t("create_trip.trip_days")}</p>
      <p className="text-right">{tripDays}</p>

      <p>{t("create_trip.trip_price")}</p>
      <p className="text-right">${displayMoneyWith2Digits(pricePerDay * tripDays)}</p>

      <p>{t("create_trip.discount_amount")}</p>
      <p className="text-rentality-alert-text text-right">
        -${displayMoneyWith2Digits((pricePerDay - pricePerDayWithDiscount) * tripDays)}
      </p>

      <p>{t("create_trip.delivery_fee_to_pick_up_location")}</p>
      <p className="text-right">${displayMoneyWith2Digits(deliveryDetails.pickUp.priceInUsd)}</p>

      <p>{t("create_trip.delivery_fee_from_drop_off_location")}</p>
      <p className="text-right">${displayMoneyWith2Digits(deliveryDetails.dropOff.priceInUsd)}</p>

      <p>{t("create_trip.sales_tax")}</p>
      <p className="text-right">${displayMoneyWith2Digits(salesTax)}</p>

      <p>{t("create_trip.government_tax")}</p>
      <p className="text-right">${displayMoneyWith2Digits(governmentTax)}</p>

      <p className="mt-4 text-lg">
        <strong>{t("create_trip.total_charge")}</strong>
      </p>
      <p className="items-baseline text-right">${displayMoneyWith2Digits(totalCharge)}</p>

      <hr className="col-span-2" />

      <p>{t("create_trip.security_deposit")}</p>
      <p className="text-right">${displayMoneyWith2Digits(securityDeposit)}</p>

      {insuranceDetails.isInsuranceRequired && !insuranceDetails.isGuestHasInsurance && (
        <>
          <p>
            {t("create_trip.insurance_fee_n_per_day", {
              insurancePerDayPriceInUsd: insuranceDetails.insurancePerDayPriceInUsd,
            })}
          </p>
          <p className="text-right">
            ${displayMoneyWith2Digits(insuranceDetails.insurancePerDayPriceInUsd * tripDays)}
          </p>
        </>
      )}

      <hr className="col-span-2" />

      <p className="text-xl">
        <strong>{t("create_trip.total_payable")}</strong>
      </p>
      <p className="text-xl">
        <strong>${displayMoneyWith2Digits(totalCharge + securityDeposit + insuranceCharge)}</strong>
      </p>

      <hr className="col-span-2" />
    </div>
  );
}
