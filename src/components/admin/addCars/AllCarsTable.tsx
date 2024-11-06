import { TFunction } from "@/utils/i18n";
import { useTranslation } from "react-i18next";
import Loading from "@/components/common/Loading";
import Image from "next/image";
import { AdminCarDetails } from "@/model/admin/AdminCarDetails";
import { cn } from "@/utils";
import RntSuspense from "@/components/common/rntSuspense";

type AllCarsTableProps = {
  isLoading: boolean;
  data: AdminCarDetails[];
};

export default function AllCarsTable({ isLoading, data }: AllCarsTableProps) {
  const { t } = useTranslation();

  const t_aac: TFunction = (name, options) => {
    return t("admin_all_cars." + name, options);
  };

  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm whitespace-pre-line";
  const rowSpanClassName = "px-2 h-12 text-center whitespace-pre-line";

  return (
    <RntSuspense
      isLoading={isLoading}
      fallback={
        <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
          <Loading />
        </div>
      }
    >
      <div className="text-xl lg:hidden">{t("common.low_resolution")}</div>
      <table className="hidden w-full table-auto border-spacing-2 overflow-x-auto lg:block">
        <thead className="mb-2">
          <tr className="border-b-[2px] border-b-gray-500">
            <th className={`${cn(headerSpanClassName, "min-w-[6ch]")}`}>#</th>
            <th className={`${cn(headerSpanClassName, "min-w-[6ch]")}`}>{t_aac("carId")}</th>
            <th className={`${cn(headerSpanClassName, "min-w-[15ch]")}`}>{t_aac("host")}</th>
            <th className={`${cn(headerSpanClassName, "min-w-[10ch]")}`}>{t_aac("status")}</th>
            <th className={`${cn(headerSpanClassName, "min-w-[10ch]")}`}>{t_aac("image")}</th>
            <th
              className={`${cn(headerSpanClassName, "min-w-[25ch]")}`}
            >{`${t_aac("country")}/${t_aac("state")}\n${t_aac("city")}`}</th>
            <th className={`${cn(headerSpanClassName, "min-w-[20ch]")}`}>
              {`${t_aac("latitude")}\n${t_aac("longitude")}\n${t_aac("timeZoneId")}`}
            </th>
            <th className={`${cn(headerSpanClassName, "min-w-[45ch]")}`}>{t_aac("homeAddress")}</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((carDetails, index) => {
            return (
              <tr key={carDetails.carId} className="border-b-[1px] border-b-gray-500">
                <td className={rowSpanClassName}>{index + 1}</td>
                <td className={rowSpanClassName}>{carDetails.carId}</td>
                <td className={rowSpanClassName}>{carDetails.hostName}</td>
                <td className={rowSpanClassName}>{carDetails.isListed ? "Listed" : "Not listed"}</td>
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
                  <span className={`${carDetails.isUserAddressFull ? "" : "text-red-500"}`}>
                    {carDetails.userAddress}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </RntSuspense>
  );
}
