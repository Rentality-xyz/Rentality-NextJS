import { BaseCarInfo, getListingStatusTextFromStatus } from "@/model/BaseCarInfo";
import RntButton from "../common/rntButton";
import Link from "next/link";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { cn } from "@/utils";
import imgDimoSynced from "@/images/img_dimo_synced.svg";
import imgFoundOnDimo from "@/images/img_found_on_dimo.svg";
import Image from "next/image";
import * as React from "react";

export default function ListingItem({
  carInfo,
  isDimoOnly,
  isDimoSynced,
  isDimoNotSyncMapped,
  onCreateRentalityCar,
  onSyncWithDimo,
  t,
}: {
  carInfo: BaseCarInfo;
  isDimoOnly?: boolean;
  isDimoSynced?: boolean;
  isDimoNotSyncMapped?: boolean;
  onCreateRentalityCar: () => void;
  onSyncWithDimo: () => void;
  t: TFunction;
}) {
  let statusBgColor = carInfo.currentlyListed ? "bg-lime-500" : "bg-red-500";
  const statusClassName = cn(
    "absolute right-0 top-2 px-8 py-2 rounded-l-3xl text-rnt-temp-status-text text-end",
    statusBgColor
  );

  const notDimoSyncedStyle = !isDimoSynced ? "flex-col" : "";

  return (
    <div className="rnt-card flex flex-col overflow-hidden rounded-xl bg-rentality-bg">
      <div
        style={{ backgroundImage: `url(${carInfo.image})` }}
        className="relative min-h-[12rem] w-full flex-shrink-0 bg-cover bg-center xl:h-[250px] fullHD:h-[320px]"
      >
        <div className={statusClassName}>
          <strong>{`${getListingStatusTextFromStatus(carInfo.currentlyListed, t)}`}</strong>
        </div>
      </div>
      <div className="flex h-full w-full flex-col justify-between p-4">
        <div className={cn("flex justify-between xl:mb-2 xl:flex-row", notDimoSyncedStyle)}>
          <div className="flex flex-col">
            <div>
              <strong className="text-lg font-bold xl:text-xl">{`${carInfo.brand} ${carInfo.model} ${carInfo.year}`}</strong>
            </div>
            <div className="text-sm font-medium text-[#FFFFFF70] lg:text-lg">{carInfo.licensePlate}</div>
          </div>
          {(isDimoOnly || isDimoNotSyncMapped) && (
            <div className="flex flex-col max-xl:my-2 xl:ml-auto">
              <div className="flex flex-col items-center rounded-3xl border border-[#FFFFFF05] bg-[#FFFFFF03] p-2.5 xl:ml-auto">
                <Image src={imgFoundOnDimo} alt="" className="" />
                <p className="mt-2 text-base font-medium text-[#FFFFFF70]">
                  {t("dimo.token_id")} {carInfo.dimoTokenId}
                </p>
                <RntButton
                  className="mt-4 w-full px-4 text-lg"
                  minHeight="40px"
                  onClick={() => {
                    {
                      if (isDimoOnly) {
                        onCreateRentalityCar();
                      } else {
                        onSyncWithDimo();
                      }
                    }
                  }}
                >
                  {isDimoOnly ? t("dimo.create_car") : t("dimo.sync_with_dimo")}
                </RntButton>
              </div>
            </div>
          )}
          <div className="flex flex-col">
            {isDimoSynced && <Image src={imgDimoSynced} alt="" className="ml-auto max-xl:w-[180px]" />}
          </div>
        </div>

        <div className="flex flex-row items-end justify-between">
          <div className="flex flex-col">
            <strong className="text-lg font-bold xl:text-xl">{`$${displayMoneyWith2Digits(carInfo.pricePerDay)}/${t("vehicles.day")}`}</strong>
            <div className="text-sm font-medium text-[#FFFFFF70] lg:text-lg">{`${getMilesIncludedPerDayText(carInfo.milesIncludedPerDay)} ${t("vehicles.miles_per_day")}`}</div>
            <div className="text-sm font-medium text-[#FFFFFF70] lg:text-lg">{`$${displayMoneyWith2Digits(carInfo.securityDeposit)} ${t("vehicles.secure_dep")}`}</div>
          </div>
          <Link href={`/host/vehicles/edit/${carInfo.carId}`}>
            <RntButton disabled={!carInfo.isEditable} className="h-12 w-28">
              {t("common.edit")}
            </RntButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
