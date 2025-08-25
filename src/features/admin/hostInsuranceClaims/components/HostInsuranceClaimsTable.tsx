import { ClaimUsers } from "@/features/admin/claimTypes/models/claims";
import { useTranslation } from "react-i18next";
import { TFunction } from "@/utils/i18n";
import RntSuspense from "@/components/common/rntSuspense";
import Loading from "@/components/common/Loading";
import moment from "moment/moment";
import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import { isEmpty } from "@/utils/string";
import Image from "next/image";
import { displayMoneyFromCentsWith2Digits } from "@/utils/numericFormatters";
import { ClaimStatus } from "@/model/blockchain/schemas";
import RntButton from "@/components/common/rntButton";
import Link from "next/link";
import ImageCarouselDialog from "@/components/createTrip/ImageCarouselDialog";
import { cn } from "@/utils";
import { Claim } from "@/features/claims/models";
import { useState } from "react";
import {
  RntTable,
  RntTableBody,
  RntTableCell,
  RntTableHead,
  RntTableHeader,
  RntTableRow,
} from "@/components/table/rntTable";

interface HostClaimsTableProps {
  isLoading: boolean;
  claims: Claim[];
  onPay: (claimId: number, currency: string) => void;
}

const defaultSliderState = {
  isOpen: false,
  images: [],
  title: "",
};

function HostInsuranceClaimsTable({ isLoading, claims, onPay }: HostClaimsTableProps) {
  const { t } = useTranslation();

  const t_history: TFunction = (path, options) => {
    return t("claims.history." + path, options);
  };

  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";

  const [sliderState, setSliderState] = useState<{ isOpen: boolean; images: string[]; title: string }>(
    defaultSliderState
  );

  const handleShowPhotos = (urls: string[]) => {
    if (urls.length === 0) return;

    setSliderState({
      isOpen: true,
      images: urls,
      title: t("claims.photos_of_complaints"),
    });
  }

  const handleCloseSlider = () => {
    setSliderState(defaultSliderState);
  }

  const redTextClassName = cn(rowSpanClassName, "text-rentality-alert-text");

  return (
    <RntSuspense
      isLoading={isLoading}
      fallback={
        <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
          <Loading />
        </div>
      }
    >
      <div className="mt-5 w-full rounded-2xl bg-rentality-bg p-4">
        <h3 className="mb-4 text-xl">{t_history("title")}</h3>
        <div className="custom-scroll w-full overflow-x-auto">
          <RntTable className="w-full table-auto border-spacing-2">
            <RntTableHeader className="w-full">
              <RntTableRow className="text-rentality-additional-light">
                <RntTableHead className={`${headerSpanClassName} min-w-[12ch]`}>{t_history("table.invoiceType")}</RntTableHead>
                <RntTableHead className={`${headerSpanClassName} min-w-[17ch]`}>{t_history("table.paymentDeadline")}</RntTableHead>
                <RntTableHead className={`${headerSpanClassName}`}>{t_history("table.reservation")}</RntTableHead>
                <RntTableHead className={`${headerSpanClassName} min-w-[15ch]`}>{t_history("table.car")}</RntTableHead>
                <RntTableHead className={`${headerSpanClassName}`}>{t_history("table.describe")}</RntTableHead>
                <RntTableHead className={`${headerSpanClassName}`}>{t_history("table.viewPhotoFile")}</RntTableHead>
                <RntTableHead className={`${headerSpanClassName} min-w-[10ch]`}>{t_history("table.amount")}</RntTableHead>
                <RntTableHead className={`${headerSpanClassName} min-w-[10ch]`}>{t_history("table.status")}</RntTableHead>
                <RntTableHead className={`${headerSpanClassName} min-w-[10ch]`}>{t_history("table.currency")}</RntTableHead>
                <RntTableHead></RntTableHead>
                <RntTableHead></RntTableHead>
                <RntTableHead></RntTableHead>
                <RntTableHead></RntTableHead>
              </RntTableRow>
            </RntTableHeader>
            <RntTableBody className="w-full text-sm">
              {claims.map((claim) => {
                const detailsLink = `/admin/trips/tripInfo/${claim.tripId}?back=/admin/hostClaims`;

                return (
                  <RntTableRow key={claim.claimId} className="w-full border-b-[1px] border-b-gray-500">
                    <RntTableCell className={rowSpanClassName}>{claim.claimTypeText}</RntTableCell>
                    <RntTableCell
                      className={
                        claim.deadlineDate <= moment.tz(claim.timeZoneId).toDate() ? redTextClassName : rowSpanClassName
                      }
                    >
                      {dateFormatShortMonthDateTime(claim.deadlineDate, claim.timeZoneId)}
                    </RntTableCell>
                    <RntTableCell className={rowSpanClassName}>{claim.tripId}</RntTableCell>
                    <RntTableCell className={rowSpanClassName}>{claim.carInfo}</RntTableCell>
                    <RntTableCell className={`${rowSpanClassName} max-w-[20ch] overflow-hidden text-ellipsis`}>
                      {claim.description}
                    </RntTableCell>
                    <RntTableCell className={rowSpanClassName}>
                      {claim.fileUrls.filter((i) => !isEmpty(i)).length > 0 ? (
                        <div
                          className="h-8 w-8 cursor-pointer"
                          onClick={() => {
                            handleShowPhotos(claim.fileUrls);
                          }}
                        >
                          <Image
                            className="h-full w-full object-cover"
                            width={36}
                            height={36}
                            src="/images/icons/ic_photo.png"
                            alt=""
                          />
                        </div>
                      ) : null}
                    </RntTableCell>
                    <RntTableCell className={rowSpanClassName}>${displayMoneyFromCentsWith2Digits(claim.amountInUsdCents)}</RntTableCell>
                    <RntTableCell className={claim.status === ClaimStatus.Overdue ? redTextClassName : rowSpanClassName}>
                      {claim.statusText}
                    </RntTableCell>
                    <RntTableCell className={rowSpanClassName}>{claim.currency.name}</RntTableCell>
                    {claim.status == ClaimStatus.NotPaid && (
                      <RntTableCell className={rowSpanClassName}>
                        <RntButton
                          className="h-8 min-h-[38px] w-24"
                          onClick={() => {
                            onPay(claim.claimId, claim.currency.currency);
                          }}
                        >
                          Pay
                        </RntButton>
                      </RntTableCell>
                    )}
                    <RntTableCell className={rowSpanClassName}>
                      <Link href={detailsLink}>
                        <i className="fi fi-br-eye pr-1 text-rentality-secondary"></i>
                      </Link>
                    </RntTableCell>
                  </RntTableRow>
                );
              })}
            </RntTableBody>
          </RntTable>
        </div>
      </div>
      <ImageCarouselDialog
        images={sliderState.images}
        isOpen={sliderState.isOpen}
        title={sliderState.title}
        isActualImageSize={true}
        onClose={handleCloseSlider}
      />
    </RntSuspense>
  );
}

export default HostInsuranceClaimsTable;
