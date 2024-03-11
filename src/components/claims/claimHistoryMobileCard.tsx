import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import Link from "next/link";
import RntButton from "../common/rntButton";
import { getStringFromMoneyInCents } from "@/utils/formInput";
import { Claim } from "@/model/Claim";
import { ClaimStatus } from "@/model/blockchain/schemas";

type Props =
  | {
      isHost: true;
      claim: Claim;
      index: number;
      cancelClaim: (claimId: number) => Promise<void>;
    }
  | {
      isHost: false;
      claim: Claim;
      index: number;
      payClaim: (claimId: number) => Promise<void>;
    };

export default function ClaimHistoryMobileCard(props: Props) {
  const { claim, index, isHost } = props;
  const chatLink = `/${isHost ? "host" : "guest"}/messages?tridId=${claim.tripId}`;
  const telLink = `tel:${isHost ? claim.guestPhoneNumber : claim.hostPhoneNumber}`;
  const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${claim.tripId}`;

  return (
    <div key={claim.claimId} className={`grid grid-cols-2 gap-2 py-8 ${index > 0 ? "border-t-4" : ""}`}>
      <p>
        <strong>Car</strong>
      </p>
      <p>{claim.carInfo}</p>
      <hr className="col-span-2" />
      <p>
        <strong>Reservation</strong>
      </p>
      <p>{claim.tripId}</p>
      <hr className="col-span-2" />
      <p>
        <strong>Invoice type</strong>
      </p>
      <p>{claim.claimTypeText}</p>
      <hr className="col-span-2" />
      <p>
        <strong>Payment deadline</strong>
      </p>
      <p className={claim.deadlineDate <= new Date() ? "text-red-400" : ""}>
        {dateFormatShortMonthDateTime(claim.deadlineDate)}
      </p>
      <hr className="col-span-2" />
      <p className="col-span-2">
        <strong>Describe</strong>
      </p>
      <p className="col-span-2">{claim.description}</p>
      <hr className="col-span-2" />
      <p>
        <strong>Amount $</strong>
      </p>
      <p className={claim.status === ClaimStatus.Overdue ? "text-red-400" : ""}>
        ${getStringFromMoneyInCents(claim.amountInUsdCents)}
      </p>
      <hr className="col-span-2" />
      <p>
        <strong>Status</strong>
      </p>
      <p>{claim.statusText}</p>
      <hr className="col-span-2" />
      <div className="col-span-2 mt-2 justify-self-center">
        {claim.status === ClaimStatus.NotPaid || claim.status === ClaimStatus.Overdue ? (
          isHost ? (
            <RntButton
              onClick={() => {
                props.cancelClaim(claim.claimId);
              }}
            >
              Cancel
            </RntButton>
          ) : (
            <RntButton
              onClick={() => {
                props.payClaim(claim.claimId);
              }}
            >
              Pay
            </RntButton>
          )
        ) : null}
      </div>
      <div className="col-span-2 mt-4 flex flex-row gap-12 justify-self-center">
        <Link href={chatLink}>
          <i className="fi fi-br-envelope pr-1"></i>
        </Link>
        <a href={telLink}>
          <i className="fi fi-br-phone-flip"></i>
        </a>
        <Link href={detailsLink}>
          <i className="fi fi-br-eye pr-1 text-rentality-secondary"></i>
        </Link>
      </div>
    </div>
  );
}
