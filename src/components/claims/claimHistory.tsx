import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import Link from "next/link";
import RntButton from "../common/rntButton";
import { twMerge } from "tailwind-merge";
import { getStringFromMoneyInCents } from "@/utils/formInput";
import { Claim } from "@/model/Claim";
import ClaimHistoryMobileCard from "./claimHistoryMobileCard";
import { ClaimStatus } from "@/model/blockchain/schemas";
import moment from "moment";
import { TFunction } from "@/utils/i18n";

type Props =
  | {
      isHost: true;
      claims: Claim[];
      cancelClaim: (claimId: number) => Promise<void>;
      t: TFunction;
    }
  | {
      isHost: false;
      claims: Claim[];
      payClaim: (claimId: number) => Promise<void>;
      t: TFunction;
    };

export default function ClaimHistory(props: Props) {
  const t_history: TFunction = (path, options) => {
    return props.t("history." + path, options);
  };
  const { isHost, claims } = props;
  const headerSpanClassName = "text-start px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12";
  const redTextClassName = twMerge(rowSpanClassName, "text-red-400");

  return (
    <div className="w-full bg-rentality-bg p-4 rounded-2xl mt-5">
      <h3 className="text-xl mb-4">{t_history("title")}</h3>
      <table className=" w-full table-auto border-spacing-2 max-lg:hidden">
        <thead className="mb-2">
          <tr className="text-rentality-additional-light ">
            <th className={headerSpanClassName}>{t_history("table.invoiceType")}</th>
            <th className={headerSpanClassName}>{t_history("table.paymentDeadline")}</th>
            <th className={headerSpanClassName}>{t_history("table.reservation")}</th>
            <th className={headerSpanClassName}>{t_history("table.car")}</th>
            <th className={headerSpanClassName}>{t_history("table.describe")}</th>
            <th className={headerSpanClassName}>{t_history("table.amount")}</th>
            <th className={headerSpanClassName}>{t_history("table.status")}</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {claims.map((claim) => {
            const chatLink = `/${isHost ? "host" : "guest"}/messages?tridId=${claim.tripId}`;
            const telLink = `tel:${isHost ? claim.guestPhoneNumber : claim.hostPhoneNumber}`;
            const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${claim.tripId}`;

            return (
              <tr key={claim.claimId} className="border-b-[1px] border-b-gray-500">
                <td className={rowSpanClassName}>{claim.claimTypeText}</td>
                <td className={claim.deadlineDate <= moment().toDate() ? redTextClassName : rowSpanClassName}>
                  {dateFormatShortMonthDateTime(claim.deadlineDate)}
                </td>
                <td className={rowSpanClassName}>{claim.tripId}</td>
                <td className={rowSpanClassName}>{claim.carInfo}</td>
                <td className={rowSpanClassName}>{claim.description}</td>
                <td className={rowSpanClassName}>${getStringFromMoneyInCents(claim.amountInUsdCents)}</td>
                <td className={claim.status === ClaimStatus.Overdue ? redTextClassName : rowSpanClassName}>
                  {claim.statusText}
                </td>
                <td className={rowSpanClassName}>
                  {claim.status === ClaimStatus.NotPaid || claim.status === ClaimStatus.Overdue ? (
                    isHost ? (
                      <RntButton
                        className="w-24 h-8"
                        onClick={() => {
                          props.cancelClaim(claim.claimId);
                        }}
                      >
                        {t_history("cancel")}
                      </RntButton>
                    ) : (
                      <RntButton
                        className="w-24 h-8"
                        onClick={() => {
                          props.payClaim(claim.claimId);
                        }}
                      >
                        {t_history("pay")}
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
      <div className="lg:hidden">
        {claims.map((claim, index) => {
          return isHost ? (
            <ClaimHistoryMobileCard
              key={claim.claimId}
              isHost={isHost}
              claim={claim}
              index={index}
              cancelClaim={props.cancelClaim}
            />
          ) : (
            <ClaimHistoryMobileCard
              key={claim.claimId}
              isHost={isHost}
              claim={claim}
              index={index}
              payClaim={props.payClaim}
            />
          );
        })}
      </div>
    </div>
  );
}
