import { VinInfo } from "@/pages/api/car-api/vinInfo";
import { TFunction } from "@/utils/i18n";
import { useState } from "react";
import { logger } from "@/utils/logger";
import RntButton from "@/components/common/rntButton";
import { cn } from "@/utils";
import * as React from "react";

type VinData = {
  checked: boolean;
  vinInfo?: VinInfo;
};

type VinNumberCellProps = {
  vinNumber: string;
  checkVin: (vin: string) => Promise<VinInfo | undefined>;
  t: TFunction;
};

export const VinNumberCell = ({ vinNumber, checkVin, t }: VinNumberCellProps) => {
  const [verifyVin, setVerifyVin] = useState<VinData>({ checked: false });
  const [isLoadingVinCheck, setIsLoadingVinCheck] = useState(false);

  const vinButtonStyle = verifyVin.checked
    ? verifyVin.vinInfo?.exists
      ? "bg-lime-500"
      : "bg-rentality-alert-text"
    : "";

  const vinButtonText = isLoadingVinCheck
    ? t("admin_all_cars.vin_loading")
    : verifyVin.checked
      ? verifyVin.vinInfo?.exists
        ? t("admin_all_cars.vin_corect")
        : t("admin_all_cars.vin_incorect")
      : t("admin_all_cars.vin_unchecked");

  async function handleCheckVin() {
    setIsLoadingVinCheck(true);
    try {
      const response = await checkVin(vinNumber);
      setVerifyVin({ checked: true, vinInfo: response });
    } catch (error) {
      logger.error("VIN check error", error);
    } finally {
      setIsLoadingVinCheck(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <RntButton
        className={cn("w-36 text-sm", vinButtonStyle)}
        type="button"
        disabled={isLoadingVinCheck}
        onClick={handleCheckVin}
      >
        {t("admin_all_cars.checkVin")}
      </RntButton>
      <p>{`(${vinButtonText})`}</p>
      {verifyVin.vinInfo?.exists && (
        <p>{`${verifyVin.vinInfo.brand} ${verifyVin.vinInfo.model} ${verifyVin.vinInfo.yearOfProduction}`}</p>
      )}
    </div>
  );
};
