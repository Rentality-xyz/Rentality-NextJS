import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { TripInsurance } from "@/model/insurance/model";
import Link from "next/link";
import RntGalleryLink from "../common/RntGalleryLink";
import Loading from "../common/Loading";

type HostInsuranceTableProps = {
  isLoading: boolean;
  data: TripInsurance[];
};

export default function HostInsuranceTable({ isLoading, data }: HostInsuranceTableProps) {
  const pathname = usePathname();
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
            const pathRoot = true ? "host" : "guest";

            const chatLink = `/${pathRoot}/messages?tridId=${i.tripId}`;
            const telLink = `tel:${true ? i.guestPhoneNumber : i.hostPhoneNumber}`;
            const detailsLink = `/${pathRoot}/trips/tripInfo/${i.tripId}?back=${pathname}`;

            return (
              <tr key={index} className="border-b-[2px] border-b-gray-500">
                <td className={rowSpanClassName}>{i.tripInfo}</td>
                <td className={rowSpanClassName}>{i.insurance.type}</td>
                <td className={rowSpanClassName}>
                  <RntGalleryLink photos={i.insurance.photos} />
                </td>
                <td className={rowSpanClassName}>{i.insurance.companyName}</td>
                <td className={rowSpanClassName}>{i.insurance.policyNumber}</td>
                <td className={rowSpanClassName}>{i.insurance.comment}</td>
                <td className={rowSpanClassName}>{i.insurance.uploadedBy}</td>
                <td className={rowSpanClassName}>
                  <div className="flex flex-row justify-center gap-2">
                    <Link href={chatLink}>
                      <i className="fi fi-br-envelope pr-1"></i>
                    </Link>
                    <a href={telLink}>
                      <i className="fi fi-br-phone-flip pr-1"></i>
                    </a>
                    <Link href={detailsLink}>
                      <i className="fi fi-br-eye pr-1 text-rentality-secondary"></i>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
