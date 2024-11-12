import { AdminCarDetails } from "@/model/admin/AdminCarDetails";
import { useState } from "react";
import Image from "next/image";
import { VinInfo } from "@/pages/api/car-api/vinInfo";
import { useTranslation } from "react-i18next";
import RntButton from "../common/rntButton";
import { cn } from "@/utils";

type VinData = {
  checked: boolean;
  vinInfo?: VinInfo;
};

const rowSpanClassName = "px-2 h-12 text-center whitespace-pre-line";

const AllCarsTableRow = ({
  carDetails,
  checkVin,
  index,
}: {
  index: number;
  carDetails: AdminCarDetails;
  checkVin: (vin: string) => Promise<VinInfo | undefined>;
}) => {
  const [verifyVin, setVerifyVin] = useState<VinData>({ checked: false });
  const [isLoadingVinCheck, setIsLoadingVinCheck] = useState(false);
  const { t } = useTranslation();

  const vinButtonStyle = verifyVin.checked
    ? verifyVin.vinInfo!.exists
      ? "bg-lime-500"
      : "bg-rentality-alert-text"
    : "";
  const vinButtonText = isLoadingVinCheck
    ? t("admin_all_cars.vin_loading")
    : verifyVin.checked
      ? verifyVin.vinInfo!.exists
        ? t("admin_all_cars.vin_corect")
        : t("admin_all_cars.vin_incorect")
      : t("admin_all_cars.vin_unchecked");

  async function handleCheckVin() {
    setIsLoadingVinCheck(true);

    try {
      const response = await checkVin(carDetails.vinNumber);
      console.debug("RESPONSE", response);
      setVerifyVin({ checked: true, vinInfo: response });
    } catch (e) {
      console.error("handleCheckVin error:", e);
    } finally {
      setIsLoadingVinCheck(false);
    }
  }

  return (
    <tr key={carDetails.carId} className="border-b-[1px] border-b-gray-500">
      <td className={rowSpanClassName}>{index + 1}</td>
      <td className={rowSpanClassName}>{carDetails.carId}</td>
      <td className={rowSpanClassName}>{carDetails.hostName}</td>
      <td className={rowSpanClassName}>{carDetails.isListed ? t("vehicles.listed") : t("vehicles.unlisted")}</td>
      <td className={rowSpanClassName}>
        <Image src={carDetails.carPhotoUrl} alt="" width={150} height={100} className="object-cover py-2" />
      </td>
      <td className={rowSpanClassName}>
        <div>{`${carDetails.country} / ${carDetails.state}`}</div>
        <div>{carDetails.city}</div>
      </td>
      <td className={rowSpanClassName}>
        <div className={`${carDetails.isUniue ? "" : "text-red-500"}`}>{carDetails.locationLatitude}</div>
        <div className={`${carDetails.isUniue ? "" : "text-red-500"}`}>{carDetails.locationLongitude}</div>
        <div>{carDetails.timeZoneId}</div>
      </td>
      <td className={rowSpanClassName}>
        <span className={`${carDetails.isUserAddressFull ? "" : "text-red-500"}`}>{carDetails.userAddress}</span>
      </td>

      <td className={rowSpanClassName}>
        <div className="flex flex-col gap-2">
          <RntButton
            className={cn("h-8 w-32 text-sm", vinButtonStyle)}
            type="button"
            disabled={isLoadingVinCheck}
            onClick={handleCheckVin}
          >
            <p>{t("admin_all_cars.checkVin")}</p>
            <p>{`(${vinButtonText})`}</p>
          </RntButton>
          {verifyVin.vinInfo && verifyVin.vinInfo.exists && (
            <p>{`${verifyVin.vinInfo.brand} ${verifyVin.vinInfo.model} ${verifyVin.vinInfo.yearOfProduction}`}</p>
          )}
        </div>
      </td>
    </tr>
  );
};
export default AllCarsTableRow;
