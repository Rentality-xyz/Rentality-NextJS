//TODO translate
import React from "react";
import useFetchOwnReferralPoints from "../hooks/useFetchOwnReferralPoints";
import useClaimOwnReferralPoints from "../hooks/useClaimOwnReferralPoints";
import useOwnReferralPointsTransactionStore from "../hooks/useOwnReferralPointsTransactionStore";
import Image from "next/image";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";

export default function ClaimMyPointsHeaderButton() {
  const { isLoading, isFetching, data } = useFetchOwnReferralPoints("ClaimMyPointsHeaderButton");
  const { mutateAsync: claimMyPoints } = useClaimOwnReferralPoints();
  const isClaiming = useOwnReferralPointsTransactionStore((state) => state.isClaiming);

  const { readyToClaim } = data;

  return (
    <button
      className="ml-[116px] hidden items-center rounded-md border border-gray-500 px-4 py-2 hover:border-gray-400 xl:flex"
      disabled={isLoading || isFetching || isClaiming || readyToClaim === 0}
      onClick={() => claimMyPoints()}
    >
      <Image src={icStarPointsYellow} alt="" className="mr-2 h-7 w-7" />
      <div className="ml-0.5 flex">
        {isClaiming ? (
          <>Claiming...</>
        ) : isLoading || isFetching ? (
          <>Loading...</>
        ) : (
          <>
            Claim <span className="px-1 font-semibold text-rentality-secondary">{readyToClaim.toString()}</span> points
          </>
        )}
      </div>
    </button>
  );
}
