import { TFunction } from "@/utils/i18n";
import { useTranslation } from "react-i18next";
import Loading from "@/components/common/Loading";
import { AdminCarDetails } from "@/model/admin/AdminCarDetails";
import { cn } from "@/utils";
import RntSuspense from "@/components/common/rntSuspense";
import AllCarsTableRow from "../AllCarsTableRow";
import { VinInfo } from "@/pages/api/car-api/vinInfo";

type AllCarsTableProps = {
  isLoading: boolean;
  data: AdminCarDetails[];
  checkVin: (vin: string) => Promise<VinInfo | undefined>;
};

const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm whitespace-pre-line";

export default function AllCarsTable({ isLoading, data, checkVin }: AllCarsTableProps) {
  const { t } = useTranslation();

  const t_comp: TFunction = (name, options) => {
    return t("admin_all_cars." + name, options);
  };

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
            <th className={`${cn(headerSpanClassName, "min-w-[6ch]")}`}>{t_comp("carId")}</th>
            <th className={`${cn(headerSpanClassName, "min-w-[15ch]")}`}>{t_comp("host")}</th>
            <th className={`${cn(headerSpanClassName, "min-w-[10ch]")}`}>{t_comp("status")}</th>
            <th className={`${cn(headerSpanClassName, "min-w-[10ch]")}`}>{t_comp("image")}</th>
            <th
              className={`${cn(headerSpanClassName, "min-w-[25ch]")}`}
            >{`${t_comp("country")}/${t_comp("state")}\n${t_comp("city")}`}</th>
            <th className={`${cn(headerSpanClassName, "min-w-[20ch]")}`}>
              {`${t_comp("latitude")}\n${t_comp("longitude")}\n${t_comp("timeZoneId")}`}
            </th>
            <th className={`${cn(headerSpanClassName, "min-w-[20ch]")}`}>{t_comp("homeAddress")}</th>
            <th className={`${cn(headerSpanClassName, "min-w-[20ch]")}`}>{t_comp("checkVin")}</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((carDetails, index) => {
            return (
              <AllCarsTableRow key={carDetails.vinNumber} index={index} carDetails={carDetails} checkVin={checkVin} />
            );
          })}
        </tbody>
      </table>
    </RntSuspense>
  );
}
