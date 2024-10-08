import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import Link from "next/link";
import RntButton from "../common/rntButton";
import { Claim } from "@/model/Claim";
import { ClaimStatus } from "@/model/blockchain/schemas";
import moment from "moment";
import { TFunction } from "@/utils/i18n";
import { displayMoneyFromCentsWith2Digits } from "@/utils/numericFormatters";
import Image from "next/image";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { isEmpty } from "@/utils/string";
import { usePathname } from "next/navigation";
import ClaimFileList from "./ClaimFileList";
import ClaimHistoryMobileCard from "./ClaimHistoryMobileCard";
import { cn } from "@/utils";
import { minHeight } from "@mui/system";

type Props = {
  isHost: boolean;
  claims: Claim[];
  payClaim: (claimId: number) => Promise<void>;
  cancelClaim: (claimId: number) => Promise<void>;
  t: TFunction;
};

export default function ClaimHistory({ isHost, claims, payClaim, cancelClaim, t }: Props) {
  const t_history: TFunction = (path, options) => {
    return t("history." + path, options);
  };
  const headerSpanClassName = "text-start px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-16";
  const redTextClassName = cn(rowSpanClassName, "text-red-400");
  const { showCustomDialog, hideDialogs } = useRntDialogs();
  const pathname = usePathname();

  function handleFilesClick(claim: Claim) {
    showCustomDialog(<ClaimFileList fileUrls={claim.fileUrls} handleBackClick={hideDialogs} />);
  }

  return (
    <div className="mt-5 w-full rounded-2xl bg-rentality-bg p-4">
      <h3 className="mb-4 text-xl">{t_history("title")}</h3>
      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto border-spacing-2 max-lg:hidden">
          <thead className="w-full">
            <tr className="text-rentality-additional-light">
              <th className={`${headerSpanClassName} min-w-[12ch]`}>{"⇄"}</th>
              <th className={`${headerSpanClassName} min-w-[12ch]`}>{t_history("table.invoiceType")}</th>
              <th className={`${headerSpanClassName} min-w-[17ch]`}>{t_history("table.paymentDeadline")}</th>
              <th className={`${headerSpanClassName}`}>{t_history("table.reservation")}</th>
              <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_history("table.car")}</th>
              <th className={`${headerSpanClassName}`}>{t_history("table.describe")}</th>
              <th className={`${headerSpanClassName}`}>{t_history("table.viewPhotoFile")}</th>
              <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_history("table.amount")}</th>
              <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_history("table.status")}</th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody className="w-full text-sm">
            {claims.map((claim) => {
              const chatLink = `/${isHost ? "host" : "guest"}/messages?tridId=${claim.tripId}`;
              const telLink = `tel:${isHost ? claim.guestPhoneNumber : claim.hostPhoneNumber}`;
              const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${claim.tripId}?back=${pathname}`;

              return (
                <tr key={claim.claimId} className="w-full border-b-[1px] border-b-gray-500">
                  <td className={rowSpanClassName}>{claim.isIncomingClaim ? "← Incoming" : "Outgoing →"}</td>
                  <td className={rowSpanClassName}>{claim.claimTypeText}</td>
                  <td
                    className={
                      claim.deadlineDate <= moment.tz(claim.timeZoneId).toDate() ? redTextClassName : rowSpanClassName
                    }
                  >
                    {dateFormatShortMonthDateTime(claim.deadlineDate, claim.timeZoneId)}
                  </td>
                  <td className={rowSpanClassName}>{claim.tripId}</td>
                  <td className={rowSpanClassName}>{claim.carInfo}</td>
                  <td className={`${rowSpanClassName} max-w-[20ch] overflow-hidden text-ellipsis`}>
                    {claim.description}
                  </td>
                  <td className={rowSpanClassName}>
                    {claim.fileUrls.filter((i) => !isEmpty(i)).length > 0 ? (
                      <div
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => {
                          handleFilesClick(claim);
                        }}
                      >
                        <Image
                          className="h-full w-full object-cover"
                          width={36}
                          height={36}
                          src="/icon_photo.png"
                          alt=""
                        />
                      </div>
                    ) : null}
                  </td>
                  <td className={rowSpanClassName}>${displayMoneyFromCentsWith2Digits(claim.amountInUsdCents)}</td>
                  <td className={claim.status === ClaimStatus.Overdue ? redTextClassName : rowSpanClassName}>
                    {claim.statusText}
                  </td>
                  <td className={rowSpanClassName}>
                    {claim.status === ClaimStatus.NotPaid || claim.status === ClaimStatus.Overdue ? (
                      claim.isIncomingClaim ? (
                        <RntButton
                          className="h-8 min-h-[38px] w-24"
                          onClick={() => {
                            payClaim(claim.claimId);
                          }}
                        >
                          {t_history("pay")}
                        </RntButton>
                      ) : (
                        <RntButton
                          className="h-8 min-h-[38px] w-24"
                          onClick={() => {
                            cancelClaim(claim.claimId);
                          }}
                        >
                          {t_history("cancel")}
                        </RntButton>
                      )
                    ) : null}
                  </td>
                  <td className={rowSpanClassName}>
                    <Link href={chatLink}>
                      <i className="fi fi-br-envelope pr-1"></i>
                    </Link>
                  </td>
                  <td className={rowSpanClassName}>
                    <a href={telLink}>
                      <i className="fi fi-br-phone-flip"></i>
                    </a>
                  </td>
                  <td className={rowSpanClassName}>
                    <Link href={detailsLink}>
                      <i className="fi fi-br-eye pr-1 text-rentality-secondary"></i>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden">
        {claims.map((claim, index) => {
          return (
            <ClaimHistoryMobileCard
              key={claim.claimId}
              isHost={isHost}
              claim={claim}
              index={index}
              payClaim={payClaim}
              cancelClaim={cancelClaim}
              t_history={t_history}
            />
          );
        })}
      </div>
    </div>
  );
}
