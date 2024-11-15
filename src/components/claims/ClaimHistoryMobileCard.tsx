import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import Link from "next/link";
import RntButton from "../common/rntButton";
import { Claim } from "@/model/Claim";
import { ClaimStatus } from "@/model/blockchain/schemas";
import { displayMoneyFromCentsWith2Digits } from "@/utils/numericFormatters";
import { usePathname } from "next/navigation";
import moment from "moment";
import { isEmpty } from "@/utils/string";
import Image from "next/image";
import { useState } from "react";
import { TFunction } from "@/utils/i18n";

type Props = {
  isHost: boolean;
  claim: Claim;
  index: number;
  payClaim: (claimId: number) => Promise<void>;
  cancelClaim: (claimId: number) => Promise<void>;
  t_history: TFunction;
};

export default function ClaimHistoryMobileCard({ claim, index, isHost, payClaim, cancelClaim, t_history }: Props) {
  const chatLink = `/${isHost ? "host" : "guest"}/messages?tridId=${claim.tripId}`;
  const telLink = `tel:${isHost ? claim.guestPhoneNumber : claim.hostPhoneNumber}`;
  const pathname = usePathname();
  const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${claim.tripId}?back=${pathname}`;

  const [isVisible, setIsVisible] = useState(false);

  const handleFilesClick = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div key={claim.claimId} className={`grid grid-cols-2 gap-2 py-4 ${index > 0 ? "border-t-4" : ""}`}>
      <p>
        <strong>⇄</strong>
      </p>
      <p>{claim.isIncomingClaim ? "← Incoming" : "Outgoing →"}</p>
      <hr className="col-span-2" />
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
      <p className={claim.deadlineDate <= moment.tz(claim.timeZoneId).toDate() ? "text-red-400" : ""}>
        {dateFormatShortMonthDateTime(claim.deadlineDate, claim.timeZoneId)}
      </p>
      <hr className="col-span-2" />
      <p>
        <strong>Describe</strong>
      </p>
      <p>{claim.description}</p>
      <hr className="col-span-2" />
      <p>
        <strong>Amount $</strong>
      </p>
      <p className={claim.status === ClaimStatus.Overdue ? "text-red-400" : ""}>
        ${displayMoneyFromCentsWith2Digits(claim.amountInUsdCents)}
      </p>
      <hr className="col-span-2" />
      <p>
        <strong>Status</strong>
      </p>
      <p>{claim.statusText}</p>
      <hr className="col-span-2" />
      {claim.fileUrls.filter((i) => !isEmpty(i)).length > 0 ? (
        <div className="col-span-2">
          <div className="mb-1 grid w-full grid-cols-2 gap-2">
            <p>
              <strong>View photo/file</strong>
            </p>
            <div
              className="mt-[-6px] h-8 w-8 cursor-pointer"
              onClick={() => {
                handleFilesClick();
              }}
            >
              <Image className="h-full w-full object-cover" width={36} height={36} src="/icon_photo.png" alt="" />
            </div>
          </div>
          {isVisible && (
            <div className="mb-4 mt-2">
              <div id="claim-photos-scrolling" className="flex space-x-2 overflow-x-auto">
                {claim.fileUrls
                  .filter((i) => !isEmpty(i))
                  .slice(0, 5)
                  .map((url, index) => (
                    <div key={index} className="h-36 w-36 flex-none">
                      <Image
                        className="h-full w-full cursor-pointer object-cover"
                        src={url}
                        alt={`Photo ${index + 1}`}
                        width={144}
                        height={144}
                        onClick={() => window.open(url)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
          <hr className="col-span-2" />
        </div>
      ) : null}
      <div className="col-span-2 mt-2 justify-self-center">
        {claim.status === ClaimStatus.NotPaid || claim.status === ClaimStatus.Overdue ? (
          claim.isIncomingClaim ? (
            <RntButton
              onClick={() => {
                payClaim(claim.claimId);
              }}
            >
              {t_history("pay")}
            </RntButton>
          ) : (
            <RntButton
              onClick={() => {
                cancelClaim(claim.claimId);
              }}
            >
              {t_history("cancel")}
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
