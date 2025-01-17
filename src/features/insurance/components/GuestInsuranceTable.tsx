import { useTranslation } from "react-i18next";
import { getInsuranceStatusText, getInsuranceTypeText, TripInsurance } from "../models";
import Loading from "@/components/common/Loading";
import RntGalleryLink from "@/components/common/RntGalleryLink";

type GuestInsuranceTableProps = {
  isLoading: boolean;
  data: TripInsurance[];
};

export default function GuestInsuranceTable({ isLoading, data }: GuestInsuranceTableProps) {
  const { t } = useTranslation();

  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";

  if (isLoading) {
    return (
      <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className="text-xl lg:hidden">{t("common.low_resolution")}</div>
      <table className="hidden w-full table-auto border-spacing-2 overflow-x-auto lg:block">
        <thead className="mb-2">
          <tr className="border-b-[2px] border-b-gray-500">
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.trip")}</th>
            <th className={`${headerSpanClassName} min-w-[20h]`}>{t("insurance.insurance_type")}</th>
            <th className={`${headerSpanClassName} min-w-[15h]`}>{t("insurance.insurance_data_status")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.view_document")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.insurance_company_name")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.insurance_policy_number")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.comment")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.uploaded_by")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t("insurance.trip_details")}</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((i, index) => {
            return (
              <tr key={index} className="border-b-[2px] border-b-gray-500">
                <td className={rowSpanClassName}>{i.tripInfo}</td>
                <td className={rowSpanClassName}>{getInsuranceTypeText(i.insurance.type, t)}</td>
                <td className={rowSpanClassName}>{getInsuranceStatusText(i.insurance.isActual, t)}</td>
                <td className={rowSpanClassName}>
                  <RntGalleryLink photos={i.insurance.photos} />
                </td>
                <td className={rowSpanClassName}>{i.insurance.companyName}</td>
                <td className={rowSpanClassName}>{i.insurance.policyNumber}</td>
                <td className={rowSpanClassName}>{i.insurance.comment}</td>
                <td className={rowSpanClassName}>{i.insurance.uploadedBy}</td>
                <td className={rowSpanClassName}></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
