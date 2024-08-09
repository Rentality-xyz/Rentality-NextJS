import { BaseCarInfo } from "@/model/BaseCarInfo";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";

export default function PublicListingItem({ carInfo, t }: { carInfo: BaseCarInfo; t: TFunction }) {
  return (
    <div className="rnt-card flex flex-col overflow-hidden rounded-xl bg-rentality-bg md:flex-row">
      <div
        style={{ backgroundImage: `url(${carInfo.image})` }}
        className="relative min-h-[12rem] w-full flex-shrink-0 bg-cover bg-center md:w-64"
      ></div>
      <div className="flex w-full flex-col justify-between p-4">
        <div className="flex flex-row items-baseline justify-between">
          <div>
            <strong className="text-xl">{`${carInfo.brand} ${carInfo.model} ${carInfo.year}`}</strong>
          </div>
          <div>{carInfo.licensePlate}</div>
        </div>
        <div className="flex flex-row items-end justify-between">
          <div className="flex flex-col">
            <strong className="text-xl">{`$${displayMoneyWith2Digits(carInfo.pricePerDay)}/${t("vehicles.day")}`}</strong>
            <div className="text-sm">{`${getMilesIncludedPerDayText(carInfo.milesIncludedPerDay)} ${t("vehicles.miles_per_day")}`}</div>
            <div className="text-sm">{`$${displayMoneyWith2Digits(carInfo.securityDeposit)} ${t("vehicles.secure_dep")}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
