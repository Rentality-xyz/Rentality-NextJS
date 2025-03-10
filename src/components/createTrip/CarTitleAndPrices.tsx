import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import React from "react";

export function CarTitleAndPrices({
  carTitle,
  pricePerDay,
  pricePerDayWithHostDiscount,
  tripDays,
  tripDiscounts,
  dimoTokenId,
}: {
  carTitle: string;
  pricePerDay: number;
  pricePerDayWithHostDiscount: number;
  tripDays: number;
  tripDiscounts: {
    discount3DaysAndMoreInPercents: number;
    discount7DaysAndMoreInPercents: number;
    discount30DaysAndMoreInPercents: number;
  };
  dimoTokenId: number;
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
    pricePerDay > pricePerDayWithHostDiscount ? (pricePerDay - pricePerDayWithHostDiscount) * tripDays : undefined;

  return (
    <div className="flex flex-wrap items-center justify-between">
      <h1 className="text-3xl">
        <strong>{carTitle}</strong>
      </h1>
      {dimoTokenId !== 0 && (
        <div className="max-xl:my-2">
          <Image src={"/images/img_dimo_synced.svg"} width={196} height={35} alt="" className="w-[180px]" />
        </div>
      )}
      <span className="flex items-center gap-4">
        {discountTotal && (
          <span className="text-2xl text-gray-500">
            <s>${displayMoneyWith2Digits(pricePerDay)}</s>
          </span>
        )}
        <span className="text-3xl">
          <strong>
            ${displayMoneyWith2Digits(pricePerDayWithHostDiscount)}/{t("common.day")}
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
